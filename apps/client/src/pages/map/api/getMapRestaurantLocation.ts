import {
  normalizeMapLocation,
  readMapId,
  readMapObject,
} from '@/pages/map/api/mapApiAdapters'
import type {
  MapLocationResponse,
  MapRestaurantLocation,
} from '@/pages/map/api/mapApiTypes'
import { request } from '@/shared/api/request'

export const getMapRestaurantLocation = async (
  id: string,
  signal?: AbortSignal,
): Promise<MapRestaurantLocation> => {
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0)
    throw new Error('Invalid map request: restaurantId')
  const data = await request<MapLocationResponse>(
    `/api/v1/restaurants/${id}/map-location`,
    { cache: 'no-store', signal },
  )
  const location = readMapObject(data, 'selected location')
  if (String(readMapId(location.restaurantId, 'restaurantId')) !== id)
    throw new Error('Invalid map API response: restaurantId mismatch')
  return normalizeMapLocation(location.location)
}
