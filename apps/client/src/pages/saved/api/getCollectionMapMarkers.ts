import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'
import {
  isValidCollectionId,
  requireCollectionId,
} from '@/features/collection/api/collectionReadContracts'
import { normalizeMapLocation } from '@/pages/map/api/mapApiAdapters'

export const getCollectionMapMarkers = async (
  collectionId: number,
  signal?: AbortSignal,
) => {
  requireCollectionId(collectionId)
  const data = await request<
    components['schemas']['CollectionMapMarkersResponse']
  >(`/api/v1/collections/${collectionId}/map-markers`, {
    signal,
    cache: 'no-store',
  })
  if (
    !data ||
    data.collectionId !== collectionId ||
    !Array.isArray(data.content)
  )
    throw new Error('Invalid collection map response')
  return data.content.flatMap((marker) => {
    if (
      !isValidCollectionId(marker.restaurantId) ||
      typeof marker.name !== 'string' ||
      !['restaurant', 'cafe', 'bar'].includes(marker.placeType ?? '')
    )
      throw new Error('Invalid collection map marker')
    if (!marker.location) return []
    return [
      {
        id: String(marker.restaurantId),
        name: marker.name,
        category: marker.placeType as 'restaurant' | 'cafe' | 'bar',
        ...normalizeMapLocation(marker.location),
      },
    ]
  })
}
