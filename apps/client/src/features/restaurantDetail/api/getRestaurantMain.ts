import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type RestaurantMainResponse = components['schemas']['RestaurantMainResponse']

export type RestaurantMain = RestaurantMainResponse & {
  restaurantId: number
  name: string
  address: string
  thumbnailUrl: string | null
  imageUrls: string[]
  reservationFee: number
}

const checkHasReservationMainFields = (
  response: RestaurantMainResponse | null,
  restaurantId: number,
): response is RestaurantMain => {
  return (
    response !== null &&
    response.restaurantId === restaurantId &&
    typeof response.name === 'string' &&
    response.name.trim().length > 0 &&
    typeof response.address === 'string' &&
    response.address.trim().length > 0 &&
    typeof response.reservationFee === 'number' &&
    Number.isFinite(response.reservationFee) &&
    response.reservationFee >= 0
  )
}

export const getRestaurantMain = async (
  restaurantId: number,
): Promise<RestaurantMain> => {
  const response = await request<RestaurantMainResponse>(
    `/api/v1/restaurants/${restaurantId}/summary`,
  )

  if (!checkHasReservationMainFields(response, restaurantId)) {
    throw new Error('식당 요약 응답에 필수 정보가 없습니다.')
  }

  return {
    ...response,
    thumbnailUrl: response.thumbnailUrl ?? null,
    imageUrls: response.imageUrls ?? [],
  }
}
