import { request } from '@/shared/api/request'
import { requireCollectionId } from '@/pages/saved/api/collectionReadContracts'

export const deleteCollection = async (collectionId: number) => {
  requireCollectionId(collectionId)
  await request<void>(`/api/v1/collections/${collectionId}`, {
    method: 'delete',
  })
}
