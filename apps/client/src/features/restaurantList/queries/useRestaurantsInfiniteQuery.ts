import {
  type InfiniteData,
  infiniteQueryOptions,
  useInfiniteQuery,
} from '@tanstack/react-query'

import {
  getRestaurants,
  type GetRestaurantsParams,
  type RestaurantsResult,
} from '@/features/restaurantList/api/getRestaurants'
import { restaurantListQueryKeys } from '@/features/restaurantList/queries/restaurantListQueryKeys'

type RestaurantsPageParam = NonNullable<GetRestaurantsParams['cursor']> | null

export const restaurantsInfiniteQueryOptions = (params: GetRestaurantsParams) =>
  infiniteQueryOptions<
    RestaurantsResult,
    Error,
    InfiniteData<RestaurantsResult>,
    ReturnType<typeof restaurantListQueryKeys.infiniteList>,
    RestaurantsPageParam
  >({
    queryFn: ({ pageParam }) =>
      getRestaurants({
        ...params,
        ...(pageParam !== null && { cursor: pageParam }),
      }),
    queryKey: restaurantListQueryKeys.infiniteList(params),
    initialPageParam: null as RestaurantsPageParam,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext) {
        return undefined
      }

      return lastPage.nextCursor ?? undefined
    },
  })

export const useRestaurantsInfiniteQuery = (
  params: GetRestaurantsParams | null,
) => {
  return useInfiniteQuery({
    ...restaurantsInfiniteQueryOptions(params ?? {}),
    enabled: params !== null,
  })
}
