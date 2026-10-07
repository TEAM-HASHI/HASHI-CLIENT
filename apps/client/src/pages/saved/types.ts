export type CollectionSort = 'latest' | 'rating' | 'reviews'
export type RestaurantCategory = 'restaurant' | 'cafe' | 'bar'
export type CollectionCategory = 'all' | RestaurantCategory
export type CollectionColor = 'red' | 'yellow' | 'green' | 'purple'

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

export type CollectionViewState = {
  collectionId: string | null
  sort: CollectionSort
  category: CollectionCategory
}

export type CollectionMapState = CollectionViewState & { collectionId: string }

export const INITIAL_COLLECTION_VIEW: CollectionViewState = {
  collectionId: null,
  sort: 'latest',
  category: 'all',
}

export const COLLECTION_SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'rating', label: '별점순' },
  { value: 'reviews', label: '리뷰순' },
] as const

export const COLLECTION_CATEGORY_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'restaurant', label: '음식점' },
  { value: 'cafe', label: '카페' },
  { value: 'bar', label: '주점' },
] as const
