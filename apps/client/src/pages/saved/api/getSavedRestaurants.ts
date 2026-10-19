import type {
  SavedRestaurantListData,
  SavedRestaurantsParamsTypes,
} from '@/pages/saved/api/collectionApiTypes'
import {
  requireCollectionId,
  validateSavedRestaurantList,
} from '@/pages/saved/api/collectionReadContracts'
import { request } from '@/shared/api/request'

export const getSavedRestaurants = async (
  collectionId: number,
  params: SavedRestaurantsParamsTypes = {},
  signal?: AbortSignal,
) => {
  requireCollectionId(collectionId)
  const data = await request<SavedRestaurantListData>(
    `/api/v1/collections/${collectionId}/restaurants`,
    {
      method: 'get',
      searchParams: params,
      signal,
    },
  )
  return validateSavedRestaurantList(data, params.cursor)
}
