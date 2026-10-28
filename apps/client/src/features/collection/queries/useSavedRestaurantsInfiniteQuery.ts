import { getAuthSessionVersion } from '@/shared/auth/authSession'
import { useCollectionSessionVersion } from '@/features/collection/hooks/useCollectionSessionVersion'
import { runWithCollectionSession } from '@/features/collection/utils/collectionSession'

import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

import { getSavedRestaurants } from '@/features/collection/api/getSavedRestaurants'
import { isValidCollectionId } from '@/features/collection/api/collectionReadContracts'
import { collectionQueryKeys } from '@/features/collection/queries/collectionQueryKeys'
import type { SavedRestaurantQueryFiltersTypes } from '@/features/collection/types/collectionReadModels'
import { getSavedRestaurantRequestParams } from '@/features/collection/utils/collectionReadAdapters'

export const savedRestaurantsInfiniteQueryOptions = (
  collectionId: number | null,
  filters: SavedRestaurantQueryFiltersTypes | null = {},
  publicView = false,
  sessionVersion = getAuthSessionVersion(),
) => {
  const params =
    filters === null ? null : getSavedRestaurantRequestParams(filters)
  return infiniteQueryOptions({
    queryKey: collectionQueryKeys.restaurants(
      collectionId,
      params,
      publicView,
      sessionVersion,
    ),
    queryFn: ({ pageParam, signal }) => {
      if (!isValidCollectionId(collectionId) || params === null)
        throw new Error('A valid collectionId and enabled filters are required')
      return runWithCollectionSession(sessionVersion, () =>
        getSavedRestaurants(
          collectionId,
          { ...params, ...(pageParam !== null && { cursor: pageParam }) },
          signal,
        ),
      )
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: isValidCollectionId(collectionId) && params !== null,
    ...(publicView && { gcTime: 0 }),
    throwOnError: false,
  })
}

export const useSavedRestaurantsInfiniteQuery = (
  collectionId: number | null,
  filters: SavedRestaurantQueryFiltersTypes | null = {},
  publicView = false,
) => {
  const sessionVersion = useCollectionSessionVersion()
  return useInfiniteQuery(
    savedRestaurantsInfiniteQueryOptions(
      collectionId,
      filters,
      publicView,
      sessionVersion,
    ),
  )
}
