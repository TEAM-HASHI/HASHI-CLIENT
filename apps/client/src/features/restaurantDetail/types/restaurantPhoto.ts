// Client view models, not a backend response contract.
export type RestaurantPhotoCategory = 'representative' | 'menu' | 'review'
export type RestaurantPhotoFilter = 'all' | RestaurantPhotoCategory

export interface RestaurantPhoto {
  id: string
  thumbnailUrl: string
  imageUrl: string
  width: number
  height: number
}

export type RestaurantPhotoCounts = Record<RestaurantPhotoFilter, number>

export interface RestaurantPhotoPage {
  photos: RestaurantPhoto[]
  counts: RestaurantPhotoCounts
  nextCursor?: string
}

export interface RestaurantPhotoRequest {
  restaurantId: number
  filter: RestaurantPhotoFilter
  cursor?: string
  signal?: AbortSignal
}

export interface RestaurantPhotoSource {
  getPage: (request: RestaurantPhotoRequest) => Promise<RestaurantPhotoPage>
}
