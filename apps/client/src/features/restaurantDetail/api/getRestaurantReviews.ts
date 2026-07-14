import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

import type { ReviewSortValue } from '@/features/restaurantDetail/constants/restaurantReview'

type RestaurantReviewResponse =
  components['schemas']['RestaurantReviewResponse']
export type RatingDistributionResponse =
  components['schemas']['RatingDistributionResponse']
export type ReviewSummaryResponse =
  components['schemas']['ReviewSummaryResponse'] & {
    imageCount?: number
    previewImageUrls?: string[]
    profileImageUrl?: string
    writerNickname?: string
    writerProfileImageUrl?: string
  }

export interface RestaurantReviewListData {
  restaurantId?: number
  averageRating: number
  reviewCount: number
  ratingDistribution?: RatingDistributionResponse
  reviews: ReviewSummaryResponse[]
  nextCursor?: number
  hasNext: boolean
}

interface GetRestaurantReviewsParams {
  restaurantId: number
  cursor?: number
  size: number
  sort: ReviewSortValue
}

const createRestaurantReviewsSearchParams = ({
  cursor,
  size,
  sort,
}: Pick<GetRestaurantReviewsParams, 'cursor' | 'size' | 'sort'>) => {
  const params = new URLSearchParams({
    size: String(size),
    sort,
  })

  if (cursor !== undefined) {
    params.set('cursor', String(cursor))
  }

  return params.toString()
}

export const getRestaurantReviews = async ({
  restaurantId,
  cursor,
  size,
  sort,
}: GetRestaurantReviewsParams): Promise<RestaurantReviewListData> => {
  const searchParams = createRestaurantReviewsSearchParams({
    cursor,
    size,
    sort,
  })
  const response = await request<RestaurantReviewResponse>(
    `/api/v1/restaurants/${restaurantId}/reviews?${searchParams}`,
  )

  return {
    restaurantId: response?.restaurantId,
    averageRating: response?.averageRating ?? 0,
    reviewCount: response?.reviewCount ?? 0,
    ratingDistribution: response?.ratingDistribution,
    reviews: response?.content ?? [],
    nextCursor: response?.nextCursor,
    hasNext: response?.hasNext === true,
  }
}
