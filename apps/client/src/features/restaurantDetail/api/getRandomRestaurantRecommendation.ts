import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

import {
  checkHasRestaurantSummaryFields,
  type RestaurantSummary,
} from '@/features/restaurantDetail/api/getRestaurantSummary'

type RestaurantMainResponse = components['schemas']['RestaurantMainResponse']

interface GetRandomRestaurantRecommendationParams {
  excludeRestaurantId?: number
}

const createRandomRestaurantRecommendationSearchParams = ({
  excludeRestaurantId,
}: GetRandomRestaurantRecommendationParams) => {
  const params = new URLSearchParams()

  if (excludeRestaurantId !== undefined) {
    params.set('excludeRestaurantId', String(excludeRestaurantId))
  }

  return params.toString()
}

export const getRandomRestaurantRecommendation = async (
  params: GetRandomRestaurantRecommendationParams = {},
): Promise<RestaurantSummary> => {
  const searchParams = createRandomRestaurantRecommendationSearchParams(params)
  const response = await request<RestaurantMainResponse>(
    `/api/v1/restaurants/recommendations/random${searchParams ? `?${searchParams}` : ''}`,
  )

  if (!checkHasRestaurantSummaryFields(response)) {
    throw new Error('오늘의 식당 추천 응답에 필수 정보가 없습니다.')
  }

  return {
    ...response,
    imageUrls: response.imageUrls,
    thumbnailUrl: response.thumbnailUrl,
  }
}
