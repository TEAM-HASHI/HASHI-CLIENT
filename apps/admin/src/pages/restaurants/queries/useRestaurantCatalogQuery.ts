import { useInfiniteQuery } from '@tanstack/react-query'
import {
  restaurantCatalogApi,
  type RestaurantCatalogParams,
} from '@/pages/restaurants/api/restaurantCatalogApi'
import { restaurantQueryKeys } from '@/pages/restaurants/queries/restaurantQueryKeys'

export const useRestaurantCatalogQuery = (
  params: Omit<RestaurantCatalogParams, 'cursor'>,
) =>
  useInfiniteQuery({
    queryKey: restaurantQueryKeys.list(params),
    queryFn: ({ pageParam }) =>
      restaurantCatalogApi.list({
        ...params,
        cursor: pageParam ?? undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  })
