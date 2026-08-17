import { useInfiniteQuery } from '@tanstack/react-query'

import { restaurantsInfiniteQueryOptions } from '@/features/restaurantList/queries/useRestaurantsInfiniteQuery'
import type { SearchRestaurantsParams } from '@/pages/search/types'
import { createSearchRestaurantsRequestParams } from '@/pages/search/utils/searchRestaurantParams'

export const useSearchRestaurantsInfiniteQuery = (
  params: SearchRestaurantsParams | null,
) => {
  const requestParams = params
    ? createSearchRestaurantsRequestParams(params)
    : undefined

  return useInfiniteQuery({
    ...restaurantsInfiniteQueryOptions(requestParams ?? {}),
    enabled: requestParams !== undefined,
    throwOnError: false,
  })
}
