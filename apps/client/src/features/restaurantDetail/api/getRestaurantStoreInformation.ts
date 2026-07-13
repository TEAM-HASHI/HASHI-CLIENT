import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type RestaurantStoreInformationResponse =
  components['schemas']['RestaurantStoreInformationResponse']

export type RestaurantStoreInformation = RestaurantStoreInformationResponse & {
  restaurantId: number
  businessHours: components['schemas']['BusinessHourResponse'][]
}

const checkHasStoreInformationFields = (
  response: RestaurantStoreInformationResponse | null,
  restaurantId: number,
): response is RestaurantStoreInformation => {
  return (
    response !== null &&
    response.restaurantId === restaurantId &&
    Array.isArray(response.businessHours)
  )
}

export const getRestaurantStoreInformation = async (
  restaurantId: number,
): Promise<RestaurantStoreInformation> => {
  const response = await request<RestaurantStoreInformationResponse>(
    `/api/v1/restaurants/${restaurantId}/store-information`,
  )

  if (!checkHasStoreInformationFields(response, restaurantId)) {
    throw new Error('식당 매장 정보 응답에 필수 정보가 없습니다.')
  }

  return response
}
