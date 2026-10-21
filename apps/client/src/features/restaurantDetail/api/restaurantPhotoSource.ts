import type { RestaurantPhotoSource } from '@/features/restaurantDetail/types/restaurantPhoto'
import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

interface RestaurantPhotoDataSource {
  key: string
  source: RestaurantPhotoSource
}

const apiSource: RestaurantPhotoSource = {
  getPage: async ({ restaurantId, filter, cursor, signal }) => {
    const apiFilter = filter.toUpperCase()
    const response = await request<
      components['schemas']['RestaurantPhotosResponse']
    >(`/api/v1/restaurants/${restaurantId}/photos`, {
      searchParams: { filter: apiFilter, ...(cursor ? { cursor } : {}) },
      signal,
      cache: 'no-store',
    })
    if (
      response?.restaurantId !== restaurantId ||
      response.filter !== apiFilter ||
      !Array.isArray(response.photos) ||
      !response.counts ||
      !['all', 'representative', 'menu', 'review'].every((key) => {
        const count = response.counts?.[key as keyof typeof response.counts]
        return (
          typeof count === 'number' && Number.isSafeInteger(count) && count >= 0
        )
      }) ||
      typeof response.totalCount !== 'number' ||
      !Number.isSafeInteger(response.totalCount) ||
      response.totalCount < 0 ||
      typeof response.hasNext !== 'boolean' ||
      (response.hasNext &&
        (typeof response.nextCursor !== 'string' ||
          !response.nextCursor ||
          response.nextCursor === cursor))
    ) {
      throw new Error('Invalid restaurant photo page')
    }
    return {
      counts: {
        all: response.counts.all!,
        representative: response.counts.representative!,
        menu: response.counts.menu!,
        review: response.counts.review!,
      },
      photos: response.photos.map((photo) => {
        if (!photo || typeof photo.photoId !== 'string' || !photo.photoId)
          throw new Error('Invalid restaurant photo id')
        const source =
          photo.image?.status === 'READY'
            ? photo.image.defaultSource
            : undefined
        const imageUrl = photo.image
          ? (source?.url ?? '')
          : (photo.imageUrl ?? '')
        return {
          id: photo.photoId,
          thumbnailUrl: imageUrl,
          imageUrl,
          width: source?.width && source.width > 0 ? source.width : 0,
          height: source?.height && source.height > 0 ? source.height : 0,
        }
      }),
      nextCursor: response.hasNext ? response.nextCursor! : undefined,
    }
  },
}

export const getRestaurantPhotoDataSource = (): RestaurantPhotoDataSource => ({
  key: 'api',
  source: apiSource,
})
