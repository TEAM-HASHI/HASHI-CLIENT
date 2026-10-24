import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'
import type { CollectionDetailData } from '@/features/collection/api/collectionApiTypes'
import { requireCollectionId } from '@/features/collection/api/collectionReadContracts'
import { requireCollectionResponse } from '@/features/collection/api/collectionMutationContracts'
import { requireRestaurantIds } from '@/features/collection/api/requireRestaurantIds'

export type SaveRestaurantBody = components['schemas']['SaveRestaurantRequest']

export const saveRestaurant = async (
  collectionId: number,
  body: SaveRestaurantBody,
) => {
  requireCollectionId(collectionId)
  requireRestaurantIds([body.restaurantId])
  const data = await request<CollectionDetailData>(
    `/api/v1/collections/${collectionId}/restaurants`,
    {
      method: 'post',
      json: body,
    },
  )
  return requireCollectionResponse(data, collectionId)
}
