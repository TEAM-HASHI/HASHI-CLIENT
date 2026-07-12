import {
  type InfiniteData,
  infiniteQueryOptions,
  useInfiniteQuery,
} from '@tanstack/react-query'

import {
  getRestaurants,
  type GetRestaurantsParams,
  type SearchRestaurantsResult,
} from '@/pages/search/api/getRestaurants'
import { searchRestaurantQueryKeys } from '@/pages/search/queries/searchRestaurantQueryKeys'
import type { SearchRestaurantsParams } from '@/pages/search/types'

const SEARCH_RESTAURANTS_PAGE_SIZE = 20

type SearchRestaurantsPageParam = NonNullable<
  GetRestaurantsParams['cursor']
> | null

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

export const searchRestaurantsInfiniteQueryOptions = (
  params: GetRestaurantsParams,
) =>
  infiniteQueryOptions<
    SearchRestaurantsResult,
    Error,
    InfiniteData<SearchRestaurantsResult>,
    ReturnType<typeof searchRestaurantQueryKeys.infiniteList>,
    SearchRestaurantsPageParam
  >({
    queryFn: ({ pageParam }) =>
      getRestaurants({
        ...params,
        ...(pageParam !== null && { cursor: pageParam }),
      }),
    queryKey: searchRestaurantQueryKeys.infiniteList(params),
    initialPageParam: null as SearchRestaurantsPageParam,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext) {
        return undefined
      }

      return lastPage.nextCursor ?? undefined
    },
  })

export const useSearchRestaurantsInfiniteQuery = (
  params: SearchRestaurantsParams | null,
) => {
  const requestParams = params
    ? createSearchRestaurantsRequestParams(params)
    : undefined

  return useInfiniteQuery({
    ...searchRestaurantsInfiniteQueryOptions(requestParams ?? {}),
    enabled: requestParams !== undefined,
    throwOnError: false,
  })
}
