import type { GetRestaurantsParams } from '@/features/restaurantList/api/getRestaurants'

export const restaurantListQueryKeys = {
  all: ['restaurantList'] as const,
  infiniteLists: () =>
    [...restaurantListQueryKeys.all, 'infiniteList'] as const,
  infiniteList: (params: GetRestaurantsParams) =>
    [...restaurantListQueryKeys.infiniteLists(), params] as const,
  lists: () => [...restaurantListQueryKeys.all, 'list'] as const,
  list: (params: GetRestaurantsParams) =>
    [...restaurantListQueryKeys.lists(), params] as const,
}
