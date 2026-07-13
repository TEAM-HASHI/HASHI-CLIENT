import type { GetSearchKeywordRecommendationsParams } from '@/pages/search/api/getSearchKeywordRecommendations'

export const searchRestaurantQueryKeys = {
  all: ['searchRestaurants'] as const,
  keywordRecommendations: (
    params: GetSearchKeywordRecommendationsParams = {},
  ) =>
    [
      ...searchRestaurantQueryKeys.all,
      'keywordRecommendations',
      params,
    ] as const,
}
