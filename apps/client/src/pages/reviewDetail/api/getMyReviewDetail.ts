import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

export type MyReviewDetailData = components['schemas']['MyReviewDetailResponse']

export const getMyReviewDetail = async (
  reviewId: number,
): Promise<MyReviewDetailData> => {
  const data = await request<MyReviewDetailData>(
    `api/v1/reviews/me/${reviewId}`,
  )

  if (data === null) {
    throw new Error('Missing API response data: GET /api/v1/reviews/me/{id}')
  }

  return data
}
