import { ADMIN_ENDPOINTS } from '@/shared/api/adminEndpoints'
import { request } from '@/shared/api/request'
import type {
  AdminResourceId,
  CreateRestaurantRequest,
  CreateRestaurantResponseData,
  UpdateRestaurantRequest,
} from '@/shared/api/adminTypes'

export const restaurantApi = {
  createRestaurant(input: CreateRestaurantRequest) {
    return request<CreateRestaurantResponseData>(ADMIN_ENDPOINTS.restaurants, {
      method: 'post',
      json: input,
    })
  },
  updateRestaurant(
    restaurantId: AdminResourceId,
    input: UpdateRestaurantRequest,
  ) {
    return request<null>(ADMIN_ENDPOINTS.restaurant(restaurantId), {
      method: 'patch',
      json: input,
    })
  },
  deleteRestaurant(restaurantId: AdminResourceId) {
    return request<null>(ADMIN_ENDPOINTS.restaurant(restaurantId), {
      method: 'delete',
    })
  },
}
