import { getAuthSessionVersion } from '@/shared/auth/authSession'
import { useCollectionSessionVersion } from '@/pages/saved/hooks/useCollectionSessionVersion'
import { runWithCollectionSession } from '@/pages/saved/utils/collectionSession'

import { queryOptions, useQuery } from '@tanstack/react-query'

import { getCollection } from '@/pages/saved/api/getCollection'
import { isValidCollectionId } from '@/pages/saved/api/collectionReadContracts'
import { collectionQueryKeys } from '@/pages/saved/queries/collectionQueryKeys'

export const collectionQueryOptions = (
  collectionId: number | null,
  publicView = false,
  sessionVersion = getAuthSessionVersion(),
) =>
  queryOptions({
    queryKey: collectionQueryKeys.detail(
      collectionId,
      publicView,
      sessionVersion,
    ),
    queryFn: ({ signal }) => {
      if (!isValidCollectionId(collectionId))
        throw new Error('A valid collectionId is required')
      return runWithCollectionSession(sessionVersion, () =>
        getCollection(collectionId, signal),
      )
    },
    enabled: isValidCollectionId(collectionId),
    ...(publicView && { gcTime: 0 }),
    throwOnError: false,
  })

export const useCollectionQuery = (
  collectionId: number | null,
  publicView = false,
) => {
  const sessionVersion = useCollectionSessionVersion()
  return useQuery(
    collectionQueryOptions(collectionId, publicView, sessionVersion),
  )
}
