import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'
import { requireCollectionId } from '@/features/collection/api/collectionReadContracts'
import { requireCollectionResponse } from '@/features/collection/api/collectionMutationContracts'
import { requireRestaurantIds } from '@/features/collection/api/requireRestaurantIds'

export type MoveSavedRestaurantsBody =
  components['schemas']['MoveSavedRestaurantsRequest']
type MoveSavedRestaurantsData =
  components['schemas']['MoveSavedRestaurantsResponse']

export const moveSavedRestaurants = async (
  collectionId: number,
  body: MoveSavedRestaurantsBody,
) => {
  requireCollectionId(collectionId)
  requireCollectionId(body.targetCollectionId)
  requireRestaurantIds(body.restaurantIds)
  const data = await request<MoveSavedRestaurantsData>(
    `/api/v1/collections/${collectionId}/restaurants/move`,
    {
      method: 'post',
      json: body,
    },
  )
  if (data === null) throw new Error('Missing collection move response')
  const sourceCollection = requireCollectionResponse(
    data.sourceCollection,
    collectionId,
  )
  const targetCollection = requireCollectionResponse(
    data.targetCollection,
    body.targetCollectionId,
  )
  return { ...data, sourceCollection, targetCollection }
}
