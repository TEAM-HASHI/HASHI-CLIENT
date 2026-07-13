import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type MyReviewCountResponse = components['schemas']['MyReviewCountResponse']

export interface MyReviewCountData {
  myReviewCount: number
}

export const getMyReviewCount = async (): Promise<MyReviewCountData> => {
  const response = await request<MyReviewCountResponse>(
    '/api/v1/reviews/me/count',
  )

  if (response === null) {
    throw new Error('Missing API response data: GET /api/v1/reviews/me/count')
  }

  if (response.reviewCount === undefined) {
    throw new Error('Missing reviewCount: GET /api/v1/reviews/me/count')
  }

  return {
    myReviewCount: response.reviewCount,
  }
}
