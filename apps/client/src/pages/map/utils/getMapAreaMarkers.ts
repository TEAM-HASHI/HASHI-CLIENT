import type {
  MapArea,
  MapAreaMarkerData,
  MapRestaurant,
} from '@/pages/map/types'

export const getMapAreaMarkers = (
  areas: readonly MapArea[],
  restaurants: readonly Pick<MapRestaurant, 'areaCode'>[],
): MapAreaMarkerData[] => {
  const counts = new Map<string, number>()
  restaurants.forEach(({ areaCode }) => {
    counts.set(areaCode, (counts.get(areaCode) ?? 0) + 1)
  })
  return areas.map((area) => ({
    ...area,
    restaurantCount: counts.get(area.code) ?? 0,
  }))
}
