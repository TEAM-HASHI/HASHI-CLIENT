import type { RestaurantPhotoSource } from '@/features/restaurantDetail/types/restaurantPhoto'
import { getRestaurantPhotos } from '@/features/restaurantDetail/api/getRestaurantPhotos'

interface RestaurantPhotoDataSource {
  key: string
  source: RestaurantPhotoSource
}

export const getRestaurantPhotoDataSource = (): RestaurantPhotoDataSource => ({
  key: 'api',
  source: { getPage: getRestaurantPhotos },
})
