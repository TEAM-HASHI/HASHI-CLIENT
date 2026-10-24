import { request } from '@/shared/api/request'
import type { CollectionDetailData } from '@/features/collection/api/collectionApiTypes'
import { requireCollectionId } from '@/features/collection/api/collectionReadContracts'
import { requireCollectionResponse } from '@/features/collection/api/collectionMutationContracts'
import { requireRestaurantIds } from '@/features/collection/api/requireRestaurantIds'

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
