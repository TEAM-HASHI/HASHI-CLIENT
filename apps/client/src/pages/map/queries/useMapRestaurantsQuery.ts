import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import { getMapRestaurants } from '@/pages/map/api/getMapRestaurants'
import type {
  MapPageRequest,
  MapRestaurantPage,
} from '@/pages/map/api/mapApiTypes'
import { mapQueryKeys } from '@/pages/map/queries/mapQueryKeys'
import { mapQueryPolicy } from '@/pages/map/queries/mapQueryOptions'
import type { MapSessionSnapshot } from '@/pages/map/types'

export const useMapRestaurantsQuery = (
  request: MapPageRequest | null,
  version: number,
  initialData?: MapSessionSnapshot['queryData'],
) =>
  useInfiniteQuery<
    MapRestaurantPage,
    Error,
    InfiniteData<MapRestaurantPage, MapPageRequest | null>,
    ReturnType<typeof mapQueryKeys.infiniteList>,
    MapPageRequest | null
  >({
    ...mapQueryPolicy,
    queryKey: mapQueryKeys.infiniteList(request, version),
    queryFn: ({ pageParam, signal }) => {
      if (!pageParam) throw new Error('Map query requires configured bounds')
      return getMapRestaurants(pageParam, signal)
    },
    initialPageParam: request,
    getNextPageParam: (lastPage): MapPageRequest | undefined =>
      lastPage.hasNext && lastPage.nextCursor
        ? { cursor: lastPage.nextCursor }
        : undefined,
    enabled: request !== null,
    initialData,
    // Only explicit actions request new rankings/sessions; focus must not replay cursors.
    staleTime: Infinity,
    refetchOnReconnect: false,
  })
