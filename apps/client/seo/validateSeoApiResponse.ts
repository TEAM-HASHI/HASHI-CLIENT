import type {
  MagazineBannerListResponse,
  MagazineListResponse,
  RestaurantListResponse,
  RestaurantMenuListResponse,
  RestaurantStoreInformationResponse,
  RestaurantSummaryResponse,
} from './types'

type JsonObject = Record<string, unknown>

const requireObject = (value: unknown, label: string): JsonObject => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} 응답 데이터가 객체가 아닙니다.`)
  }

  return value as JsonObject
}

const requireArray = (value: unknown, label: string) => {
  if (!Array.isArray(value)) {
    throw new Error(`${label} 응답 데이터의 목록이 배열이 아닙니다.`)
  }
}

const requirePagination = (
  response: JsonObject,
  label: string,
  cursorType: 'number' | 'string',
) => {
  if (typeof response.hasNext !== 'boolean') {
    throw new Error(`${label} 응답 데이터의 hasNext가 boolean이 아닙니다.`)
  }

  if (
    response.hasNext &&
    (typeof response.nextCursor !== cursorType || response.nextCursor === '')
  ) {
    throw new Error(
      `${label} 응답 데이터의 nextCursor가 ${cursorType}이 아닙니다.`,
    )
  }
}

export const validateRestaurantListResponse = (
  value: unknown,
): RestaurantListResponse => {
  const response = requireObject(value, '식당 목록')
  requireArray(response.content, '식당 목록')
  requirePagination(response, '식당 목록', 'string')
  return response as RestaurantListResponse
}

export const validateRestaurantMenuListResponse = (
  value: unknown,
): RestaurantMenuListResponse => {
  const response = requireObject(value, '메뉴 목록')
  requireArray(response.content, '메뉴 목록')
  requirePagination(response, '메뉴 목록', 'number')
  return response as RestaurantMenuListResponse
}

export const validateMagazineListResponse = (
  value: unknown,
): MagazineListResponse => {
  const response = requireObject(value, '매거진 목록')
  requireArray(response.magazines, '매거진 목록')
  requirePagination(response, '매거진 목록', 'number')
  return response as MagazineListResponse
}

export const validateMagazineBannerListResponse = (
  value: unknown,
): MagazineBannerListResponse => {
  const response = requireObject(value, '매거진 배너')
  requireArray(response.banners, '매거진 배너')
  return response as MagazineBannerListResponse
}

export const validateRestaurantSummaryResponse = (
  value: unknown,
): RestaurantSummaryResponse =>
  requireObject(value, '식당 상세') as RestaurantSummaryResponse

export const validateRestaurantStoreInformationResponse = (
  value: unknown,
): RestaurantStoreInformationResponse =>
  requireObject(value, '매장 정보') as RestaurantStoreInformationResponse
