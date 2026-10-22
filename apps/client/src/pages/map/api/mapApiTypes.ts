import type {
  MapAreaMarkerData,
  MapBounds,
  MapPosition,
  MapRestaurant,
} from '@/pages/map/types'
import type { components, operations } from '@/shared/api/generated/openapi'

type MapApiQuery = NonNullable<operations['getPage']['parameters']['query']>
export type MapApiSort = NonNullable<MapApiQuery['sort']>
export type MapNewQuery = Required<
  Pick<MapApiQuery, 'south' | 'north' | 'west' | 'east' | 'sort'>
> &
  Pick<MapApiQuery, 'mapRegionId' | 'keyword' | 'genre' | 'placeType'>
export type MapPageRequest =
  | (MapNewQuery & { cursor?: never; querySessionId?: never })
  | ({ querySessionId: string; sort: MapApiSort } & Partial<
      Record<Exclude<keyof MapNewQuery, 'sort'> | 'cursor', never>
    >)
  | ({ cursor: string } & Partial<
      Record<keyof MapNewQuery | 'querySessionId', never>
    >)

export type MapPageResponse = components['schemas']['RestaurantMapPageResponse']
export type MapRegionsResponse =
  components['schemas']['RestaurantMapRegionsResponse']
export type MapLocationResponse =
  components['schemas']['RestaurantMapLocationResponse']
export type MapCardResponse = components['schemas']['MapCardResponse']

export interface MapRestaurantLocation {
  position: MapPosition
  validUntil: string
  attributions: { displayName: string; uri: string }[]
}

export interface MapRestaurantPage {
  restaurants: MapRestaurant[]
  hasNext: boolean
  nextCursor?: string
  querySessionId: string
  expiresAt: string
  rankingAsOf: string
  searchResult?: { totalCount: number; bounds: MapBounds | null }
  query: MapNewQuery
}

export interface MapRegions {
  initialBounds: MapBounds
  queryLimits: {
    supportedBounds: MapBounds
    maxLatitudeSpan: number
    maxLongitudeSpan: number
  }
  regions: MapAreaMarkerData[]
}
