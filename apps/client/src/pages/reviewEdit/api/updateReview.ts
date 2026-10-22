import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

export type UpdateReviewBody = components['schemas']['UpdateReviewRequest']

export const updateReview = async (
  reviewId: number,
  body: UpdateReviewBody,
) => {
  await request<unknown>(`/api/v1/reviews/${reviewId}`, {
    method: 'patch',
    json: body,
  })
}
