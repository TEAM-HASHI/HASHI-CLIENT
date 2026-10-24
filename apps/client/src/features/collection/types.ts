export type CollectionSort = 'latest' | 'rating' | 'reviews'
export type RestaurantCategory = 'restaurant' | 'cafe' | 'bar'
export type CollectionCategory = 'all' | RestaurantCategory
export type CollectionColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'

export type CollectionViewState = {
  collectionId: string | null
  sort: CollectionSort
  category: CollectionCategory
}

export type CollectionMapState = CollectionViewState & {
  collectionId: string
  origin?: 'map'
}

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

export type CollectionManagementAction = {
  collectionId: string
  type: 'edit' | 'move' | 'remove' | 'delete' | 'share'
  dialog?: 'move' | 'remove'
  restaurantIds?: readonly string[]
}
