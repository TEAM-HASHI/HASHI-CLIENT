import type {
  CollectionListData,
  SavedRestaurantListData,
} from '@/pages/saved/api/collectionApiTypes'

export const isValidCollectionId = (
  value: number | null | undefined,
): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0

export const requireCollectionId = (value: number) => {
  if (!isValidCollectionId(value))
    throw new Error('A valid collectionId is required')
}

// Pagination fields are documented by the API but optional in generated types.
// A broken page must not become a successful empty list or silently end pagination.
export const validateCollectionList = (
  data: CollectionListData | null,
  requestedCursor?: number,
) => {
  if (
    data === null ||
    !Array.isArray(data.collections) ||
    typeof data.totalCount !== 'number' ||
    !Number.isSafeInteger(data.totalCount) ||
    data.totalCount < 0 ||
    typeof data.hasNext !== 'boolean' ||
    (data.hasNext &&
      (!isValidCollectionId(data.nextCursor) ||
        data.nextCursor === requestedCursor))
  ) {
    throw new Error('Invalid API response data: GET /api/v1/collections')
  }
  return data
}

export const validateSavedRestaurantList = (
  data: SavedRestaurantListData | null,
  requestedCursor?: string,
) => {
  if (
    data === null ||
    !Array.isArray(data.content) ||
    typeof data.hasNext !== 'boolean' ||
    (data.hasNext &&
      (typeof data.nextCursor !== 'string' ||
        data.nextCursor.length === 0 ||
        data.nextCursor === requestedCursor))
  ) {
    throw new Error(
      'Invalid API response data: GET /api/v1/collections/{id}/restaurants',
    )
  }
  return data
}
