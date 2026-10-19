import type { QueryClient } from '@tanstack/react-query'

import type { CollectionDetailData } from '@/pages/saved/api/collectionApiTypes'
import { isValidCollectionId } from '@/pages/saved/api/collectionReadContracts'
import { collectionQueryKeys } from '@/pages/saved/queries/collectionQueryKeys'

export const synchronizeCollectionHeader = async (
  queryClient: QueryClient,
  detail: CollectionDetailData,
) => {
  const { collectionId } = detail
  if (!isValidCollectionId(collectionId))
    throw new Error('Invalid collectionId')
  const queryKey = collectionQueryKeys.detail(collectionId)
  await queryClient.cancelQueries({ queryKey, exact: true })
  queryClient.setQueryData(queryKey, detail)
  return collectionId
}
