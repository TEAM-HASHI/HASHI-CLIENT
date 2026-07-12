import { ADMIN_ENDPOINTS } from '@/shared/api/adminEndpoints'
import { request } from '@/shared/api/request'
import type { components, paths } from '@/shared/api/generated/openapi'

export type CreateRestaurantBody =
  paths['/api/v1/admin/restaurants']['post']['requestBody']['content']['application/json']
export type UpdateRestaurantBody =
  paths['/api/v1/admin/restaurants/{restaurantId}']['patch']['requestBody']['content']['application/json']
export type AdminRestaurantData =
  components['schemas']['AdminRestaurantResponse']

type RestaurantId =
  paths['/api/v1/admin/restaurants/{restaurantId}']['patch']['parameters']['path']['restaurantId']

export const restaurantApi = {
  createRestaurant(input: CreateRestaurantBody) {
    return request<AdminRestaurantData>(ADMIN_ENDPOINTS.restaurants, {
      method: 'post',
      json: input,
    })
  },
  updateRestaurant(restaurantId: RestaurantId, input: UpdateRestaurantBody) {
    return request<AdminRestaurantData>(
      ADMIN_ENDPOINTS.restaurant(restaurantId),
      {
        method: 'patch',
        json: input,
      },
    )
  },
  deleteRestaurant(restaurantId: RestaurantId) {
    return request<unknown>(ADMIN_ENDPOINTS.restaurant(restaurantId), {
      method: 'delete',
    })
  },
}
