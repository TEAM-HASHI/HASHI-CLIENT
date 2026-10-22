import type {
  CollectionDetailData,
  CollectionSummaryData,
  SavedRestaurantData,
  SavedRestaurantsFiltersTypes,
} from '@/pages/saved/api/collectionApiTypes'
import type { CollectionCategory, CollectionSort } from '@/pages/saved/types'

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

// Read models intentionally preserve absent fields. They do not satisfy the
// complete mock CollectionData contract used by the current publishing UI.
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
