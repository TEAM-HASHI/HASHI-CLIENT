import placeholder from '@/features/restaurantDetail/mocks/assets/photo-placeholder.png'
import { createRestaurantPhotoSource } from '@/features/restaurantDetail/mocks/createRestaurantPhotoSource'
import type { RestaurantPhotoFixture } from '@/features/restaurantDetail/mocks/createRestaurantPhotoSource'
import type { RestaurantPhotoRequest } from '@/features/restaurantDetail/types/restaurantPhoto'

// Development fixtures use the Figma checker, never actual restaurant/review data.
export const getPreviewPhotoPage = (request: RestaurantPhotoRequest) => {
  const fixtures: RestaurantPhotoFixture[] = Array.from(
    { length: 45 },
    (_, index) => ({
      id: `preview-${index}`,
      originalId: `preview-${index}`,
      restaurantId: request.restaurantId,
      category: index < 12 ? 'representative' : index < 30 ? 'review' : 'menu',
      thumbnailUrl: placeholder,
      imageUrl: placeholder,
      width: 256,
      height: 256,
      order: index,
      publishedAt: new Date(Date.UTC(2026, 8, 30 - (index % 30))).toISOString(),
      isPublic: true,
    }),
  )
  return createRestaurantPhotoSource(fixtures).getPage(request)
}
