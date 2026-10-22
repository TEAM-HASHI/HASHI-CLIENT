import { getAuthSessionVersion } from '@/shared/auth/authSession'
import { useCollectionSessionVersion } from '@/pages/saved/hooks/useCollectionSessionVersion'
import { runWithCollectionSession } from '@/pages/saved/utils/collectionSession'

import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

import type { CollectionsListFiltersTypes } from '@/pages/saved/api/collectionApiTypes'
import { getCollections } from '@/pages/saved/api/getCollections'
import { collectionQueryKeys } from '@/pages/saved/queries/collectionQueryKeys'

export const collectionsInfiniteQueryOptions = (
  params: CollectionsListFiltersTypes | null,
  sessionVersion = getAuthSessionVersion(),
) =>
  infiniteQueryOptions({
    queryKey: collectionQueryKeys.infiniteList(params, sessionVersion),
    queryFn: ({ pageParam, signal }) => {
      if (params === null)
        throw new Error('Collection list parameters are disabled')
      return runWithCollectionSession(sessionVersion, () =>
        getCollections(
          { ...params, ...(pageParam !== null && { cursor: pageParam }) },
          signal,
        ),
      )
    },
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: params !== null,
    throwOnError: false,
  })

// The consumer must pass null until the authenticated user context is ready.
export const useCollectionsInfiniteQuery = (
  params: CollectionsListFiltersTypes | null,
) => {
  const sessionVersion = useCollectionSessionVersion()
  return useInfiniteQuery(
    collectionsInfiniteQueryOptions(params, sessionVersion),
  )
}
