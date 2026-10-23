import { getAuthSessionVersion } from '@/shared/auth/authSession'
import { useCollectionSessionVersion } from '@/features/collection/hooks/useCollectionSessionVersion'
import { runWithCollectionSession } from '@/features/collection/utils/collectionSession'

import { queryOptions, useQuery } from '@tanstack/react-query'

import { getCollection } from '@/features/collection/api/getCollection'
import { isValidCollectionId } from '@/features/collection/api/collectionReadContracts'
import { collectionQueryKeys } from '@/features/collection/queries/collectionQueryKeys'

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
