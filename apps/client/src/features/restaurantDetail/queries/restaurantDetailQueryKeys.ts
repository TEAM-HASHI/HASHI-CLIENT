import type { ReviewSortValue } from '@/features/restaurantDetail/constants/restaurantReview'

export const restaurantDetailQueryKeys = {
  all: ['restaurants'] as const,
  randomRecommendation: (excludeRestaurantId?: number) =>
    [
      ...restaurantDetailQueryKeys.all,
      'randomRecommendation',
      { excludeRestaurantId },
    ] as const,
  details: () => [...restaurantDetailQueryKeys.all, 'detail'] as const,
  detail: (restaurantId: number) =>
    [...restaurantDetailQueryKeys.details(), restaurantId] as const,
  main: (restaurantId: number) =>
    [...restaurantDetailQueryKeys.detail(restaurantId), 'main'] as const,
  summary: (restaurantId: number) =>
    [...restaurantDetailQueryKeys.detail(restaurantId), 'summary'] as const,
  storeInformation: (restaurantId: number) =>
    [
      ...restaurantDetailQueryKeys.detail(restaurantId),
      'storeInformation',
    ] as const,
  menus: (restaurantId: number, size: number) =>
    [
      ...restaurantDetailQueryKeys.detail(restaurantId),
      'menus',
      { size },
    ] as const,
  reviews: (restaurantId: number, size: number, sort: ReviewSortValue) =>
    [
      ...restaurantDetailQueryKeys.detail(restaurantId),
      'reviews',
      { size, sort },
    ] as const,
}
