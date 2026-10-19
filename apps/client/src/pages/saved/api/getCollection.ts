import type { CollectionDetailData } from '@/pages/saved/api/collectionApiTypes'
import { requireCollectionId } from '@/pages/saved/api/collectionReadContracts'
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
