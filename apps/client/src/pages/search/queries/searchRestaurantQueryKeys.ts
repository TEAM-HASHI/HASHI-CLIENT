import type { GetRestaurantsParams } from '@/pages/search/api/getRestaurants'
import type { GetSearchKeywordRecommendationsParams } from '@/pages/search/api/getSearchKeywordRecommendations'

export const searchRestaurantQueryKeys = {
  all: ['searchRestaurants'] as const,
  infiniteLists: () =>
    [...searchRestaurantQueryKeys.all, 'infiniteList'] as const,
  infiniteList: (params: GetRestaurantsParams) =>
    [...searchRestaurantQueryKeys.infiniteLists(), params] as const,
  keywordRecommendations: (
    params: GetSearchKeywordRecommendationsParams = {},
  ) =>
    [
      ...searchRestaurantQueryKeys.all,
      'keywordRecommendations',
      params,
    ] as const,
  lists: () => [...searchRestaurantQueryKeys.all, 'list'] as const,
  list: (params: GetRestaurantsParams) =>
    [...searchRestaurantQueryKeys.lists(), params] as const,
}
