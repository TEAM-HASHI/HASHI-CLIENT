import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'
import type { CollectionDetailData } from '@/pages/saved/api/collectionApiTypes'
import { requireCollectionId } from '@/pages/saved/api/collectionReadContracts'
import { requireCollectionResponse } from '@/pages/saved/api/collectionMutationContracts'
import { requireRestaurantIds } from '@/pages/saved/api/requireRestaurantIds'

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
