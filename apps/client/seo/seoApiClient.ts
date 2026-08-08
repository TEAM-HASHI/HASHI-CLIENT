import type {
  MagazineBannerListResponse,
  MagazineListParams,
  MagazineListResponse,
  RestaurantListParams,
  RestaurantListResponse,
  RestaurantMenuListParams,
  RestaurantMenuListResponse,
  RestaurantStoreInformationResponse,
  RestaurantSummaryResponse,
  SeoApi,
} from './types'
import {
  validateMagazineBannerListResponse,
  validateMagazineListResponse,
  validateRestaurantListResponse,
  validateRestaurantMenuListResponse,
  validateRestaurantStoreInformationResponse,
  validateRestaurantSummaryResponse,
} from './validateSeoApiResponse'

interface ApiEnvelope<T> {
  code?: string
  data?: T
  message?: string
  success?: boolean
}

interface CreateSeoApiClientParams {
  baseUrl: string
  fetchImpl?: typeof fetch
  wait?: (milliseconds: number) => Promise<void>
}

type ResponseValidator<T> = (value: unknown) => T

class SeoApiRequestError extends Error {
  readonly retryable: boolean

  constructor(message: string, retryable: boolean) {
    super(message)
    this.name = 'SeoApiRequestError'
    this.retryable = retryable
  }
}

const RETRY_DELAYS = [500, 1000] as const

const defaultWait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds)
  })

const normalizeBaseUrl = (baseUrl: string) => {
  const normalized = baseUrl.trim().replace(/\/+$/, '')

  if (!normalized) {
    throw new Error('SEO API base URL이 비어 있습니다.')
  }

  return normalized
}

const createQueryString = (params: object) => {
  const query = new URLSearchParams()
  const entries = Object.entries(params) as [
    string,
    string | number | undefined,
  ][]

  entries.forEach(([key, value]) => {
    if (value !== undefined) {
      query.set(key, String(value))
    }
  })

  const value = query.toString()
  return value ? `?${value}` : ''
}

const isRetryableFetchError = (error: unknown) =>
  error instanceof TypeError ||
  (error instanceof DOMException &&
    (error.name === 'AbortError' || error.name === 'TimeoutError'))

export const createSeoApiClient = ({
  baseUrl,
  fetchImpl = fetch,
  wait = defaultWait,
}: CreateSeoApiClientParams): SeoApi => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)

  const request = async <T>(
    path: string,
    validate: ResponseValidator<T>,
  ): Promise<T> => {
    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt += 1) {
      try {
        const response = await fetchImpl(`${normalizedBaseUrl}${path}`, {
          headers: { accept: 'application/json' },
          method: 'GET',
          signal: AbortSignal.timeout(10_000),
        })

        if (!response.ok) {
          throw new SeoApiRequestError(
            `SEO API ${path} 요청이 HTTP ${response.status}로 실패했습니다.`,
            response.status >= 500,
          )
        }

        let envelope: ApiEnvelope<T>

        try {
          envelope = (await response.json()) as ApiEnvelope<T>
        } catch {
          throw new SeoApiRequestError(
            `SEO API ${path} 응답 봉투를 JSON으로 읽을 수 없습니다.`,
            false,
          )
        }

        if (
          !envelope ||
          envelope.success !== true ||
          !Object.prototype.hasOwnProperty.call(envelope, 'data') ||
          envelope.data === undefined ||
          envelope.data === null
        ) {
          throw new SeoApiRequestError(
            `SEO API ${path} 응답 봉투가 유효하지 않습니다.`,
            false,
          )
        }

        try {
          return validate(envelope.data)
        } catch (error) {
          const reason =
            error instanceof Error ? error.message : '알 수 없는 데이터 오류'

          throw new SeoApiRequestError(
            `SEO API ${path} 응답 데이터가 유효하지 않습니다: ${reason}`,
            false,
          )
        }
      } catch (error) {
        const retryable =
          error instanceof SeoApiRequestError
            ? error.retryable
            : isRetryableFetchError(error)

        if (!retryable || attempt === RETRY_DELAYS.length) {
          throw error
        }

        await wait(RETRY_DELAYS[attempt])
      }
    }

    throw new Error(`SEO API ${path} 재시도 상태가 올바르지 않습니다.`)
  }

  return {
    getMagazineBanners: () =>
      request<MagazineBannerListResponse>(
        '/api/v1/magazines/banners',
        validateMagazineBannerListResponse,
      ),
    getMagazines: (params: MagazineListParams) =>
      request<MagazineListResponse>(
        `/api/v1/magazines${createQueryString(params)}`,
        validateMagazineListResponse,
      ),
    getRestaurantMenus: (
      restaurantId: number,
      params: RestaurantMenuListParams,
    ) =>
      request<RestaurantMenuListResponse>(
        `/api/v1/restaurants/${restaurantId}/menus${createQueryString(params)}`,
        validateRestaurantMenuListResponse,
      ),
    getRestaurants: (params: RestaurantListParams) =>
      request<RestaurantListResponse>(
        `/api/v1/restaurants${createQueryString(params)}`,
        validateRestaurantListResponse,
      ),
    getRestaurantStoreInformation: (restaurantId: number) =>
      request<RestaurantStoreInformationResponse>(
        `/api/v1/restaurants/${restaurantId}/store-information`,
        validateRestaurantStoreInformationResponse,
      ),
    getRestaurantSummary: (restaurantId: number) =>
      request<RestaurantSummaryResponse>(
        `/api/v1/restaurants/${restaurantId}/summary`,
        validateRestaurantSummaryResponse,
      ),
  }
}
