import { request } from '@/shared/api'
import type { components, operations } from '@/shared/api/generated/openapi'

export type GetRestaurantsParams = NonNullable<
  operations['getRestaurants']['parameters']['query']
>

export type RestaurantListResponse =
  components['schemas']['RestaurantListResponse']

export type RestaurantSummaryResponse =
  components['schemas']['RestaurantSummaryResponse']

export interface RestaurantsResult {
  restaurants: RestaurantSummaryResponse[]
  nextCursor?: string
  hasNext: boolean
}

export const getRestaurants = async (params: GetRestaurantsParams) => {
  const data = await request<RestaurantListResponse>('/api/v1/restaurants', {
    searchParams: params,
  })

  return {
    hasNext: data?.hasNext ?? false,
    nextCursor: data?.nextCursor,
    restaurants: data?.content ?? [],
  } satisfies RestaurantsResult
}
