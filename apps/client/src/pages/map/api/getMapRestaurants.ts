import { normalizeMapRestaurantPage } from '@/pages/map/api/mapApiAdapters'
import type {
  MapPageRequest,
  MapPageResponse,
  MapRestaurantPage,
} from '@/pages/map/api/mapApiTypes'
import { serializeMapRequest } from '@/pages/map/api/serializeMapRequest'
import { request } from '@/shared/api/request'

export const getMapRestaurants = async (
  params: MapPageRequest,
  signal?: AbortSignal,
): Promise<MapRestaurantPage> => {
  const data = await request<MapPageResponse>('/api/v1/restaurants/map', {
    searchParams: serializeMapRequest(params),
    cache: 'no-store',
    signal,
  })
  return normalizeMapRestaurantPage(data)
}
