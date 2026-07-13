import { request } from '@/shared/api/request'
import type { components } from '@/shared/api/generated/openapi'

export type ReviewContextData = components['schemas']['ReviewContextResponse']

export const getReviewContext = async (reservationId: number) => {
  const data = await request<ReviewContextData>(
    `/api/v1/reviews/context?reservationId=${reservationId}`,
  )

  if (!data) {
    throw new Error('리뷰 작성 정보를 불러오지 못했습니다.')
  }

  return data
}
