import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'
import type { CollectionDetailData } from '@/features/collection/api/collectionApiTypes'
import { requireCollectionId } from '@/features/collection/api/collectionReadContracts'
import { requireCollectionResponse } from '@/features/collection/api/collectionMutationContracts'

export type UpdateCollectionBody =
  components['schemas']['UpdateRestaurantCollectionRequest']

export const updateCollection = async (
  collectionId: number,
  body: UpdateCollectionBody,
) => {
  requireCollectionId(collectionId)
  const data = await request<CollectionDetailData>(
    `/api/v1/collections/${collectionId}`,
    {
      method: 'patch',
      json: body,
    },
  )
  return requireCollectionResponse(data, collectionId)
}
