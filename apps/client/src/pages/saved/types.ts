import type {
  CollectionColor,
  RestaurantCategory,
} from '@/features/collection/types'

export type SavedRestaurant = {
  id: string
  name: string
  image: string | null
  rating: number
  reviewCount: number
  region: string
  cuisine: string
  category: RestaurantCategory
  visibility: 'visible' | 'hidden' | 'deleted'
}

export type SavedCollection = {
  id: string
  name: string
  description: string
  createdAt: string
  isPublic: boolean
  color: CollectionColor
  coverImages: readonly [string | null, string | null, string | null]
  restaurants: readonly { restaurantId: string; savedAt: string }[]
}

export type CollectionData = {
  collections: readonly SavedCollection[]
  restaurants: readonly SavedRestaurant[]
}
