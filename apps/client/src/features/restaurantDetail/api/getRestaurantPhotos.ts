import type {
  RestaurantPhoto,
  RestaurantPhotoCounts,
  RestaurantPhotoFilter,
  RestaurantPhotoPage,
  RestaurantPhotoRequest,
} from '@/features/restaurantDetail/types/restaurantPhoto'
import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type PhotoResponse = components['schemas']['Photo']
type PhotoPageResponse = components['schemas']['RestaurantPhotosResponse']
const FILTER_CODES = {
  all: 'ALL',
  representative: 'REPRESENTATIVE',
  menu: 'MENU',
  review: 'REVIEW',
} as const satisfies Record<RestaurantPhotoFilter, PhotoPageResponse['filter']>

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
const hasCounts = (
  counts: PhotoPageResponse['counts'],
): counts is RestaurantPhotoCounts =>
  !!counts &&
  isCount(counts.all) &&
  isCount(counts.representative) &&
  isCount(counts.menu) &&
  isCount(counts.review)
const positiveDimension = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : undefined

const toPhoto = (photo: PhotoResponse): RestaurantPhoto => {
  if (!photo || typeof photo.photoId !== 'string' || !photo.photoId.trim())
    throw new Error('Invalid restaurant photo identifier')
  const source =
    photo.image?.status === 'READY' ? photo.image.defaultSource : undefined
  // An unavailable asset must not fall back to an obsolete legacy/original URL.
  const imageUrl = (photo.image ? source?.url : photo.imageUrl) ?? ''
  return {
    id: photo.photoId,
    thumbnailUrl: imageUrl,
    imageUrl,
    width: positiveDimension(source?.width),
    height: positiveDimension(source?.height),
  }
}

export const getRestaurantPhotos = async ({
  restaurantId,
  filter,
  cursor,
  signal,
}: RestaurantPhotoRequest): Promise<RestaurantPhotoPage> => {
  const apiFilter = FILTER_CODES[filter]
  const response = await request<PhotoPageResponse>(
    `/api/v1/restaurants/${restaurantId}/photos`,
    {
      searchParams: { filter: apiFilter, ...(cursor ? { cursor } : {}) },
      signal,
      cache: 'no-store',
    },
  )
  if (
    !response ||
    response.restaurantId !== restaurantId ||
    response.filter !== apiFilter ||
    !hasCounts(response.counts) ||
    !isCount(response.totalCount) ||
    !Array.isArray(response.photos) ||
    typeof response.hasNext !== 'boolean' ||
    (response.hasNext &&
      (typeof response.nextCursor !== 'string' ||
        !response.nextCursor ||
        response.nextCursor === cursor))
  )
    throw new Error('Invalid restaurant photo page response')
  return {
    photos: response.photos.map(toPhoto),
    counts: response.counts,
    nextCursor: response.hasNext ? response.nextCursor : undefined,
  }
}
