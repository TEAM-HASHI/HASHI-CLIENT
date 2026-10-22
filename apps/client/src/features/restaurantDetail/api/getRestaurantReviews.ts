import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

import type { ReviewSortValue } from '@/features/restaurantDetail/constants/restaurantReview'

type RestaurantReviewResponse =
  components['schemas']['RestaurantReviewResponse']
export type RatingDistributionResponse =
  components['schemas']['RatingDistributionResponse']
export type ReviewSummaryResponse =
  components['schemas']['ReviewSummaryResponse'] & {
    profileImageUrl?: string
    writerNickname?: string
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
  signal?: AbortSignal
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
  signal,
}: GetRestaurantReviewsParams): Promise<RestaurantReviewListData> => {
  const searchParams = createRestaurantReviewsSearchParams({
    cursor,
    size,
    sort,
  })
  const response = await request<RestaurantReviewResponse>(
    `/api/v1/restaurants/${restaurantId}/reviews?${searchParams}`,
    ...(signal ? [{ signal }] : []),
  )

  if (
    !response ||
    !Array.isArray(response.content) ||
    typeof response.hasNext !== 'boolean' ||
    (response.hasNext &&
      (!Number.isSafeInteger(response.nextCursor) ||
        (response.nextCursor ?? 0) <= 0 ||
        response.nextCursor === cursor))
  ) {
    throw new Error('Invalid restaurant review list response')
  }

  return {
    restaurantId: response.restaurantId,
    averageRating: response.averageRating ?? 0,
    reviewCount: response.reviewCount ?? 0,
    ratingDistribution: response.ratingDistribution,
    reviews: response.content,
    nextCursor: response.nextCursor,
    hasNext: response.hasNext,
  }
}
