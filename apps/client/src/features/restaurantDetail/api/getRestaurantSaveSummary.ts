import {
  getMyRestaurantSaves,
  getRestaurantSaveCounts,
} from '@/features/collection/api/getRestaurantSaves'

export const getRestaurantSaveCount = async (
  restaurantId: number,
  signal?: AbortSignal,
): Promise<number | undefined> => {
  const counts = await getRestaurantSaveCounts([restaurantId], signal)
  return counts[restaurantId]
}

export const getMyRestaurantSaved = async (
  restaurantId: number,
  signal?: AbortSignal,
): Promise<boolean> => {
  const saves = await getMyRestaurantSaves([restaurantId], signal)
  return saves[restaurantId] ?? false
}
