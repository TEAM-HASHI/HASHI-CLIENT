import type {
  CollectionDetailData,
  CollectionSummaryData,
  SavedRestaurantData,
  SavedRestaurantsFiltersTypes,
} from '@/features/collection/api/collectionApiTypes'
import type {
  CollectionCategory,
  CollectionSort,
} from '@/features/collection/types'

export interface SavedRestaurantQueryFiltersTypes {
  sort?: CollectionSort
  category?: CollectionCategory
  size?: SavedRestaurantsFiltersTypes['size']
}

interface CollectionPresentationTypes {
  id: string
  isPublic: boolean | undefined
  coverImages: readonly [string | null, string | null, string | null]
}

// Preserve absent API fields so the UI can distinguish them from explicit values.
export type CollectionSummaryReadModelTypes = CollectionPresentationTypes &
  Pick<CollectionSummaryData, 'name' | 'color' | 'savedCount' | 'saved'>

export type CollectionDetailReadModelTypes = CollectionPresentationTypes &
  Pick<
    CollectionDetailData,
    'name' | 'color' | 'savedCount' | 'description' | 'owner' | 'createdAt'
  >

export type SavedRestaurantReadModelTypes = Pick<
  SavedRestaurantData,
  'name' | 'rating' | 'reviewCount' | 'thumbnailImage' | 'savedAt'
> & {
  id: string
  region: SavedRestaurantData['area']
  cuisine: SavedRestaurantData['foodCategory']
  category: SavedRestaurantData['placeType']
  image: SavedRestaurantData['thumbnailUrl']
}
