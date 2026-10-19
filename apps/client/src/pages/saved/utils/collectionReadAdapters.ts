import type {
  CollectionDetailData,
  CollectionSummaryData,
  SavedRestaurantData,
  SavedRestaurantsFiltersTypes,
} from '@/pages/saved/api/collectionApiTypes'
import { isValidCollectionId } from '@/pages/saved/api/collectionReadContracts'
import type {
  CollectionDetailReadModelTypes,
  CollectionSummaryReadModelTypes,
  SavedRestaurantQueryFiltersTypes,
  SavedRestaurantReadModelTypes,
} from '@/pages/saved/types/collectionReadModels'

export const getSavedRestaurantRequestParams = (
  filters: SavedRestaurantQueryFiltersTypes = {},
): SavedRestaurantsFiltersTypes => ({
  sort: filters.sort === 'reviews' ? 'review' : (filters.sort ?? 'latest'),
  ...(filters.category &&
    filters.category !== 'all' && { placeType: filters.category }),
  ...(filters.size !== undefined && { size: filters.size }),
})

const getReadId = (id: number | undefined, field: string) => {
  if (!isValidCollectionId(id))
    throw new Error(`Missing or invalid ${field} in API response`)
  return String(id)
}

const mapCollectionPresentation = (
  data: CollectionSummaryData | CollectionDetailData,
) => {
  const images = data.cover?.imageUrls
  const coverImages: readonly [string | null, string | null, string | null] = [
    images?.[0] ?? null,
    images?.[1] ?? null,
    images?.[2] ?? null,
  ]
  let isPublic: boolean | undefined
  if (data.visibility === 'public') isPublic = true
  if (data.visibility === 'private') isPublic = false
  return {
    id: getReadId(data.collectionId, 'collectionId'),
    name: data.name ?? undefined,
    color: data.color ?? undefined,
    savedCount: data.savedCount ?? undefined,
    isPublic,
    coverImages,
  }
}

export const mapCollectionSummary = (
  data: CollectionSummaryData,
): CollectionSummaryReadModelTypes => ({
  ...mapCollectionPresentation(data),
  saved: data.saved ?? undefined,
})

export const mapCollectionDetail = (
  data: CollectionDetailData,
): CollectionDetailReadModelTypes => ({
  ...mapCollectionPresentation(data),
  description: data.description ?? undefined,
  owner: data.owner ?? undefined,
  createdAt: data.createdAt ?? undefined,
})

export const mapSavedRestaurant = (
  data: SavedRestaurantData,
): SavedRestaurantReadModelTypes => ({
  id: getReadId(data.restaurantId, 'restaurantId'),
  name: data.name ?? undefined,
  rating: data.rating ?? undefined,
  reviewCount: data.reviewCount ?? undefined,
  region: data.area ?? undefined,
  cuisine: data.foodCategory ?? undefined,
  category: data.placeType ?? undefined,
  image: data.thumbnailUrl ?? undefined,
  thumbnailImage: data.thumbnailImage ?? undefined,
  savedAt: data.savedAt ?? undefined,
})
