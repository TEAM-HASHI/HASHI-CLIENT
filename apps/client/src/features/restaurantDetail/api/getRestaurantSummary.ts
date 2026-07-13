import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type RestaurantMainResponse = components['schemas']['RestaurantMainResponse']

export type RestaurantSummary = RestaurantMainResponse & {
  restaurantId: number
  name: string
  address: string
  imageUrls: string[]
  reservationFee: number
}

export const checkHasRestaurantSummaryFields = (
  response: RestaurantMainResponse | null,
  restaurantId?: number,
): response is RestaurantSummary => {
  return (
    response !== null &&
    (restaurantId === undefined || response.restaurantId === restaurantId) &&
    typeof response.restaurantId === 'number' &&
    typeof response.name === 'string' &&
    response.name.trim().length > 0 &&
    typeof response.address === 'string' &&
    response.address.trim().length > 0 &&
    Array.isArray(response.imageUrls) &&
    typeof response.reservationFee === 'number' &&
    Number.isFinite(response.reservationFee) &&
    response.reservationFee >= 0
  )
}

export const getRestaurantSummary = async (
  restaurantId: number,
): Promise<RestaurantSummary> => {
  const response = await request<RestaurantMainResponse>(
    `/api/v1/restaurants/${restaurantId}/summary`,
  )

  if (!checkHasRestaurantSummaryFields(response, restaurantId)) {
    throw new Error('식당 요약 응답에 필수 정보가 없습니다.')
  }

  return {
    ...response,
    imageUrls: response.imageUrls,
    thumbnailUrl: response.thumbnailUrl,
  }
}
