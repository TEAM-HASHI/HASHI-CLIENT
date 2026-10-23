import type { CollectionDetailData } from '@/features/collection/api/collectionApiTypes'
import { requireCollectionId } from '@/features/collection/api/collectionReadContracts'
import { request } from '@/shared/api/request'

export const getCollection = async (
  collectionId: number,
  signal?: AbortSignal,
) => {
  requireCollectionId(collectionId)
  const data = await request<CollectionDetailData>(
    `/api/v1/collections/${collectionId}`,
    {
      method: 'get',
      signal,
    },
  )
  if (data === null)
    throw new Error('Missing API response data: GET /api/v1/collections/{id}')
  return data
}
