import { getAuthSessionVersion } from '@/shared/auth/authSession'
import { assertCollectionSession } from '@/features/collection/utils/collectionSession'

import type { QueryClient } from '@tanstack/react-query'

import type { CollectionDetailData } from '@/features/collection/api/collectionApiTypes'
import { isValidCollectionId } from '@/features/collection/api/collectionReadContracts'
import { collectionQueryKeys } from '@/features/collection/queries/collectionQueryKeys'

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
