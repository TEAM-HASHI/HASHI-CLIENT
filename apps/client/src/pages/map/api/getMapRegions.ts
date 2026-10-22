import { normalizeMapRegions } from '@/pages/map/api/mapApiAdapters'
import type {
  MapRegions,
  MapRegionsResponse,
} from '@/pages/map/api/mapApiTypes'
import { request } from '@/shared/api/request'

export const getMapRegions = async (
  signal?: AbortSignal,
): Promise<MapRegions> => {
  const data = await request<MapRegionsResponse>(
    '/api/v1/restaurants/map/regions',
    { cache: 'no-store', signal },
  )
  return normalizeMapRegions(data)
}
