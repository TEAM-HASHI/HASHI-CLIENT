import { getAuthSessionVersion } from '@/shared/auth/authSession'
import { assertCollectionSession } from '@/pages/saved/utils/collectionSession'

import type { QueryClient } from '@tanstack/react-query'

import type { CollectionDetailData } from '@/pages/saved/api/collectionApiTypes'
import { isValidCollectionId } from '@/pages/saved/api/collectionReadContracts'
import { collectionQueryKeys } from '@/pages/saved/queries/collectionQueryKeys'

export const synchronizeCollectionHeader = async (
  queryClient: QueryClient,
  detail: CollectionDetailData,
  sessionVersion = getAuthSessionVersion(),
) => {
  assertCollectionSession(sessionVersion)
  const { collectionId } = detail
  if (!isValidCollectionId(collectionId))
    throw new Error('Invalid collectionId')
  const queryKey = collectionQueryKeys.detail(
    collectionId,
    false,
    sessionVersion,
  )
  await queryClient.cancelQueries({ queryKey, exact: true })
  assertCollectionSession(sessionVersion)
  queryClient.setQueryData(queryKey, detail)
  return collectionId
}
