import { request } from '@/shared/api'
import type { components, operations } from '@/shared/api/generated/openapi'

export type GetSearchKeywordRecommendationsParams =
  operations['getSearchKeywordRecommendations']['parameters']['query']

type RestaurantSearchKeywordRecommendationResponse =
  components['schemas']['RestaurantSearchKeywordRecommendationResponse']

export const getSearchKeywordRecommendations = async (
  params: GetSearchKeywordRecommendationsParams = {},
) => {
  const data = await request<RestaurantSearchKeywordRecommendationResponse>(
    '/api/v1/restaurants/search-keyword-recommendations',
    {
      searchParams: params,
    },
  )

  return data?.keywords ?? []
}
