import { isValidCollectionId } from '@/pages/saved/api/collectionReadContracts'

export const requireRestaurantIds = (restaurantIds: readonly number[]) => {
  if (
    restaurantIds.length === 0 ||
    restaurantIds.some((id) => !isValidCollectionId(id))
  ) {
    throw new Error('Valid restaurantIds are required')
  }
}
