export type MapCategory = 'restaurant' | 'bar' | 'cafe'
export type MapSort = 'recommended' | 'rating' | 'reviews'
export type MapPanelStage = 'collapsed' | 'normal' | 'expanded'

export interface MapPosition {
  lat: number
  lng: number
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface MapCameraSnapshot {
  center: MapPosition
  zoom: number
  bounds: MapBounds
  minZoom?: number
}

export interface MapArea {
  code: string
  name: string
  position: MapPosition
}

export interface MapAreaMarkerData extends MapArea {
  restaurantCount: number
}

export interface MapRestaurant {
  id: string
  name: string
  areaCode: string
  category: MapCategory
  cuisine: string
  rating: number
  reviewCount: number
  saveCount: number
  recommendationRank: number
  menuKeywords: string[]
  images: string[]
  hours: string
  price: string
  description: string
  address: string
  position: MapPosition
}

export interface MapConditions {
  keyword: string
  category: MapCategory | 'all'
  areaCode: string | null
  sort: MapSort
}

export interface MapSessionSnapshot {
  conditions: MapConditions
  searchBounds: MapBounds | null
  camera: MapCameraSnapshot | null
  restaurants?: MapRestaurant[]
  nextCursor?: string
  selectedId: string | null
  isExploring: boolean
  stage: MapPanelStage
  detailStage: MapPanelStage
  selectionCamera?: MapCameraSnapshot | null
  selectionStage?: MapPanelStage
}
