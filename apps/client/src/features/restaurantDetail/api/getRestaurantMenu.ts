import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

export type RestaurantMenuDetailResponse =
  components['schemas']['RestaurantMenuDetailResponse']

interface GetRestaurantMenuParams {
  restaurantId: number
  menuId: number
}

export const getRestaurantMenu = async ({
  restaurantId,
  menuId,
}: GetRestaurantMenuParams): Promise<RestaurantMenuDetailResponse | null> => {
  return request<RestaurantMenuDetailResponse>(
    `/api/v1/restaurants/${restaurantId}/menus/${menuId}`,
  )
}
