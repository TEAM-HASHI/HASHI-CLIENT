export const STATIC_PUBLIC_PATHS = [
  '/',
  '/restaurants/hashi-pick',
  '/restaurants/popular',
  '/magazines',
]

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_MAX_PAGES = 100
const DEFAULT_CONCURRENCY = 4

const checkIsPositiveSafeInteger = (value) =>
  Number.isSafeInteger(value) && value > 0

export const validateApiBaseUrl = ({ apiBaseUrl, vercelEnv }) => {
  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL 환경 변수가 필요합니다.')
  }

  let url

  try {
    url = new URL(apiBaseUrl)
  } catch (cause) {
    throw new Error('VITE_API_BASE_URL이 유효한 URL이 아닙니다.', { cause })
  }

  if (vercelEnv === 'production') {
    const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
    const isDevelopmentApi =
      url.hostname === 'dev-api.hashi.kr' || url.hostname.startsWith('dev-api.')

    if (isLocalhost || isDevelopmentApi) {
      throw new Error('운영 빌드는 운영 API origin을 사용해야 합니다.')
    }
  }

  return url
}

const requestData = async ({ fetchImpl, url }) => {
  let response

  try {
    response = await fetchImpl(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    })
  } catch (cause) {
    throw new Error(`공개 경로 API 요청에 실패했습니다: ${url}`, { cause })
  }

  if (response.status === 404) {
    return { kind: 'not-found' }
  }

  if (!response.ok) {
    throw new Error(
      `공개 경로 API가 HTTP ${response.status}로 실패했습니다: ${url}`,
    )
  }

  let body

  try {
    body = await response.json()
  } catch (cause) {
    throw new Error(`공개 경로 API 응답이 JSON 형식이 아닙니다: ${url}`, {
      cause,
    })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    body.success !== true ||
    !Object.hasOwn(body, 'data')
  ) {
    throw new Error(`공개 경로 API 응답 형식이 올바르지 않습니다: ${url}`)
  }

  return { kind: 'success', data: body.data }
}

const collectRestaurantIds = async ({ apiBaseUrl, fetchImpl, maxPages }) => {
  const restaurantIds = new Set()
  const seenCursors = new Set()
  let cursor

  for (let page = 0; page < maxPages; page += 1) {
    const url = new URL('/api/v1/restaurants', apiBaseUrl)
    url.searchParams.set('size', String(DEFAULT_PAGE_SIZE))

    if (cursor !== undefined) {
      url.searchParams.set('cursor', cursor)
    }

    const result = await requestData({ fetchImpl, url: url.toString() })

    if (result.kind !== 'success') {
      throw new Error('공개 식당 목록 API에서 404를 반환했습니다.')
    }

    const data = result.data

    if (
      typeof data !== 'object' ||
      data === null ||
      !Array.isArray(data.content) ||
      typeof data.hasNext !== 'boolean'
    ) {
      throw new Error('공개 식당 목록 응답 형식이 올바르지 않습니다.')
    }

    data.content.forEach((restaurant) => {
      if (
        typeof restaurant !== 'object' ||
        restaurant === null ||
        !checkIsPositiveSafeInteger(restaurant.restaurantId)
      ) {
        throw new Error(
          '공개 식당 목록에 유효하지 않은 restaurantId가 있습니다.',
        )
      }

      restaurantIds.add(restaurant.restaurantId)
    })

    if (!data.hasNext) {
      return [...restaurantIds].sort((a, b) => a - b)
    }

    if (typeof data.nextCursor !== 'string' || data.nextCursor.length === 0) {
      throw new Error('다음 공개 식당 목록 cursor가 올바르지 않습니다.')
    }

    if (seenCursors.has(data.nextCursor)) {
      throw new Error(
        `공개 식당 목록 cursor가 반복되었습니다: ${data.nextCursor}`,
      )
    }

    seenCursors.add(data.nextCursor)
    cursor = data.nextCursor
  }

  throw new Error(`공개 식당 목록이 ${maxPages}페이지 제한을 초과했습니다.`)
}

const mapWithConcurrency = async (items, concurrency, mapper) => {
  const results = new Array(items.length)
  let nextIndex = 0

  const worker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1
      results[currentIndex] = await mapper(items[currentIndex])
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker),
  )

  return results
}

const validateRestaurantIds = async ({
  apiBaseUrl,
  concurrency,
  fetchImpl,
  logger,
  restaurantIds,
}) => {
  const results = await mapWithConcurrency(
    restaurantIds,
    concurrency,
    async (restaurantId) => {
      const url = new URL(
        `/api/v1/restaurants/${restaurantId}/summary`,
        apiBaseUrl,
      )
      const result = await requestData({ fetchImpl, url: url.toString() })

      if (result.kind === 'not-found') {
        logger.warn(
          `[seo] 상세 요약 404로 프리렌더링에서 제외합니다: restaurantId=${restaurantId}`,
        )
        return null
      }

      if (
        typeof result.data !== 'object' ||
        result.data === null ||
        result.data.restaurantId !== restaurantId
      ) {
        throw new Error(
          `식당 상세 요약 응답 형식이 올바르지 않습니다: restaurantId=${restaurantId}`,
        )
      }

      return restaurantId
    },
  )

  return results.filter((restaurantId) => restaurantId !== null)
}

export const createPublicRouteManifest = async ({
  apiBaseUrl,
  concurrency = DEFAULT_CONCURRENCY,
  fetchImpl = fetch,
  logger = console,
  maxPages = DEFAULT_MAX_PAGES,
  vercelEnv = process.env.VERCEL_ENV,
}) => {
  const validatedApiBaseUrl = validateApiBaseUrl({ apiBaseUrl, vercelEnv })
  const discoveredRestaurantIds = await collectRestaurantIds({
    apiBaseUrl: validatedApiBaseUrl,
    fetchImpl,
    maxPages,
  })
  const restaurantIds = await validateRestaurantIds({
    apiBaseUrl: validatedApiBaseUrl,
    concurrency,
    fetchImpl,
    logger,
    restaurantIds: discoveredRestaurantIds,
  })

  return {
    version: 1,
    restaurantIds,
    paths: [
      ...STATIC_PUBLIC_PATHS,
      ...restaurantIds.map((restaurantId) => `/restaurants/${restaurantId}`),
    ],
  }
}
