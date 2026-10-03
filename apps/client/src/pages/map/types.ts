export type MapCategory = 'restaurant' | 'bar' | 'cafe'
export type MapSort = 'recommended' | 'rating' | 'reviews'
export type MapPanelStage = 'collapsed' | 'normal' | 'expanded'

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
  marker: { x: number; y: number }
}

export interface MapConditions {
  keyword: string
  category: MapCategory | 'all'
  areaCode: string | null
  sort: MapSort
}
