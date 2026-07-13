import { request } from '@/shared/api/request'
import type { components } from '@/shared/api/generated/openapi'

export type CreateReviewBody = components['schemas']['CreateReviewRequest']
type CreateReviewResponse = components['schemas']['CreateReviewResponse']
export type CreateReviewData = Omit<CreateReviewResponse, 'reviewId'> & {
  reviewId: number
}

export const createReview = async (
  body: CreateReviewBody,
): Promise<CreateReviewData> => {
  const data = await request<CreateReviewResponse>('/api/v1/reviews', {
    method: 'post',
    json: body,
  })

  if (!data?.reviewId || data.reviewId <= 0) {
    throw new Error('리뷰 등록 결과를 확인할 수 없습니다.')
  }

  return {
    ...data,
    reviewId: data.reviewId,
  }
}
