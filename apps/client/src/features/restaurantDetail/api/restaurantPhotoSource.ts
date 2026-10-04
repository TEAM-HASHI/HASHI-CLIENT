import type { RestaurantPhotoSource } from '@/features/restaurantDetail/types/restaurantPhoto'

interface RestaurantPhotoDataSource {
  key: string
  source: RestaurantPhotoSource
}

const previewSource: RestaurantPhotoSource = {
  getPage: async (request) => {
    if (!import.meta.env.DEV)
      throw new Error('Photo preview is only available in development')
    const { getPreviewPhotoPage } =
      await import('@/features/restaurantDetail/mocks/restaurantPhotoPreview')
    return getPreviewPhotoPage(request)
  },
}

// Select the real API adapter here once its contract is confirmed.
export const getRestaurantPhotoDataSource =
  (): RestaurantPhotoDataSource | null =>
    import.meta.env.DEV ? { key: 'preview', source: previewSource } : null
