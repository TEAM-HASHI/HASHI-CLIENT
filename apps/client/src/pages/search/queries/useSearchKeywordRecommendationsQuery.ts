import { queryOptions, useQuery } from '@tanstack/react-query'

import {
  getSearchKeywordRecommendations,
  type GetSearchKeywordRecommendationsParams,
} from '@/pages/search/api/getSearchKeywordRecommendations'
import { searchRestaurantQueryKeys } from '@/pages/search/queries/searchRestaurantQueryKeys'

const DEFAULT_RECOMMENDATION_SIZE = 8

interface UseSearchKeywordRecommendationsQueryParams {
  enabled?: boolean
}

export const searchKeywordRecommendationsQueryOptions = (
  params: GetSearchKeywordRecommendationsParams = {
    size: DEFAULT_RECOMMENDATION_SIZE,
  },
) =>
  queryOptions({
    queryFn: () => getSearchKeywordRecommendations(params),
    queryKey: searchRestaurantQueryKeys.keywordRecommendations(params),
  })

export const useSearchKeywordRecommendationsQuery = ({
  enabled = true,
}: UseSearchKeywordRecommendationsQueryParams = {}) => {
  return useQuery({
    ...searchKeywordRecommendationsQueryOptions(),
    enabled,
    throwOnError: false,
  })
}
