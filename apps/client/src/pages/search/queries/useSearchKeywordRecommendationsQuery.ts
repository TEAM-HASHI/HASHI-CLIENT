import { queryOptions, useQuery } from '@tanstack/react-query'

import {
  getSearchKeywordRecommendations,
  type GetSearchKeywordRecommendationsParams,
} from '@/pages/search/api/getSearchKeywordRecommendations'
import { searchRestaurantQueryKeys } from '@/pages/search/queries/searchRestaurantQueryKeys'

const DEFAULT_RECOMMENDATION_SIZE = 8

export const searchKeywordRecommendationsQueryOptions = (
  params: GetSearchKeywordRecommendationsParams = {
    size: DEFAULT_RECOMMENDATION_SIZE,
  },
) =>
  queryOptions({
    queryFn: () => getSearchKeywordRecommendations(params),
    queryKey: searchRestaurantQueryKeys.keywordRecommendations(params),
  })

export const useSearchKeywordRecommendationsQuery = () => {
  return useQuery({
    ...searchKeywordRecommendationsQueryOptions(),
    throwOnError: false,
  })
}
