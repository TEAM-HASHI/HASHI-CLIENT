import { request } from '@/shared/api/request'
import type { CollectionDetailData } from '@/pages/saved/api/collectionApiTypes'
import { requireCollectionId } from '@/pages/saved/api/collectionReadContracts'
import { requireCollectionResponse } from '@/pages/saved/api/collectionMutationContracts'
import { requireRestaurantIds } from '@/pages/saved/api/requireRestaurantIds'

export const removeSavedRestaurants = async (
  collectionId: number,
  restaurantIds: readonly number[],
) => {
  requireCollectionId(collectionId)
  requireRestaurantIds(restaurantIds)
  const data = await request<CollectionDetailData>(
    `/api/v1/collections/${collectionId}/restaurants`,
    {
      method: 'delete',
      searchParams: { restaurantIds: restaurantIds.join(',') },
    },
  )
  return requireCollectionResponse(data, collectionId)
}
