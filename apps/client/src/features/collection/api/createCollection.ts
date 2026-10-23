import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'
import type { CollectionDetailData } from '@/features/collection/api/collectionApiTypes'
import { requireCollectionResponse } from '@/features/collection/api/collectionMutationContracts'

export type CreateCollectionBody =
  components['schemas']['CreateRestaurantCollectionRequest']

export const createCollection = async (body: CreateCollectionBody) => {
  const data = await request<CollectionDetailData>('/api/v1/collections', {
    method: 'post',
    json: body,
  })
  return requireCollectionResponse(data)
}
