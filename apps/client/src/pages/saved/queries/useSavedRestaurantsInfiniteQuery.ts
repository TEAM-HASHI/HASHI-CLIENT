import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

import { getSavedRestaurants } from '@/pages/saved/api/getSavedRestaurants'
import { isValidCollectionId } from '@/pages/saved/api/collectionReadContracts'
import { collectionQueryKeys } from '@/pages/saved/queries/collectionQueryKeys'
import type { SavedRestaurantQueryFiltersTypes } from '@/pages/saved/types/collectionReadModels'
import { getSavedRestaurantRequestParams } from '@/pages/saved/utils/collectionReadAdapters'

export const savedRestaurantsInfiniteQueryOptions = (
  collectionId: number | null,
  filters: SavedRestaurantQueryFiltersTypes | null = {},
) => {
  const params =
    filters === null ? null : getSavedRestaurantRequestParams(filters)
  return infiniteQueryOptions({
    queryKey: collectionQueryKeys.restaurants(collectionId, params),
    queryFn: ({ pageParam, signal }) => {
      if (!isValidCollectionId(collectionId) || params === null)
        throw new Error('A valid collectionId and enabled filters are required')
      return getSavedRestaurants(
        collectionId,
        { ...params, ...(pageParam !== null && { cursor: pageParam }) },
        signal,
      )
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: isValidCollectionId(collectionId) && params !== null,
    throwOnError: false,
  })
}

export const useSavedRestaurantsInfiniteQuery = (
  collectionId: number | null,
  filters: SavedRestaurantQueryFiltersTypes | null = {},
) =>
  useInfiniteQuery(savedRestaurantsInfiniteQueryOptions(collectionId, filters))
