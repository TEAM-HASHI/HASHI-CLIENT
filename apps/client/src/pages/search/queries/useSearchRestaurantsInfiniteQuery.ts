import { useInfiniteQuery } from '@tanstack/react-query'

import { type GetRestaurantsParams } from '@/features/restaurantList/api/getRestaurants'
import { restaurantsInfiniteQueryOptions } from '@/features/restaurantList/queries/useRestaurantsInfiniteQuery'
import type { SearchRestaurantsParams } from '@/pages/search/types'

const SEARCH_RESTAURANTS_PAGE_SIZE = 10

const apiGenreByCategory = {
  all: 'all',
  etc: 'etc',
  fried: 'fried',
  nabe: 'nabe',
  noodle: 'noodle',
  riceBowl: 'rice-bowl',
  sushiSashimi: 'sushi',
  teppanGrill: 'grill',
} satisfies Record<SearchRestaurantsParams['category'], string>

export const createSearchRestaurantsRequestParams = ({
  category,
  keyword,
  sort,
}: SearchRestaurantsParams): GetRestaurantsParams => {
  return {
    genre: apiGenreByCategory[category],
    keyword,
    size: SEARCH_RESTAURANTS_PAGE_SIZE,
    ...(sort !== 'default' && { sort }),
  }
}

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
