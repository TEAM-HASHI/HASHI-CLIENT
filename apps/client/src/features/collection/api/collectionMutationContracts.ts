import type { CollectionDetailData } from '@/features/collection/api/collectionApiTypes'
import { isValidCollectionId } from '@/features/collection/api/collectionReadContracts'

export const requireCollectionResponse = (
  data: CollectionDetailData | null | undefined,
  expectedId?: number,
): CollectionDetailData => {
  if (
    !data ||
    !isValidCollectionId(data.collectionId) ||
    (expectedId !== undefined && data.collectionId !== expectedId)
  ) {
    throw new Error('Invalid collection mutation response')
  }
  return data
}
