import { MAP_PREVIEW_RESTAURANTS } from '@/pages/map/data/mapPreviewRestaurants'
import { filterMapRestaurants } from '@/pages/map/utils/filterMapRestaurants'
import type { MapBounds, MapConditions, MapRestaurant } from '@/pages/map/types'

export interface MapPreviewRequest {
  conditions: MapConditions
  bounds: MapBounds | null
  cursor?: string
}
export interface MapPreviewResult {
  restaurants: MapRestaurant[]
  nextCursor?: string
}
export type MapPreviewSource = (
  request: MapPreviewRequest,
) => Promise<MapPreviewResult>

// Explicit preview source, not a backend endpoint or server cursor implementation.
export const queryMapPreview: MapPreviewSource = async ({
  conditions,
  bounds,
  cursor,
}) => {
  const all = filterMapRestaurants(MAP_PREVIEW_RESTAURANTS, conditions, bounds)
  const offset = Number(cursor ?? 0)
  return {
    restaurants: all.slice(offset, offset + 10),
    nextCursor: offset + 10 < all.length ? String(offset + 10) : undefined,
  }
}
