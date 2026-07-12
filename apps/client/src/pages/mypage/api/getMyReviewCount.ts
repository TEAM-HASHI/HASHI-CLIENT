import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type MyReviewCountResponse = components['schemas']['MyReviewCountResponse']

type MypageReviewCount = {
  myReviewCount: number
}

export const getMyReviewCount = async (): Promise<MypageReviewCount> => {
  const response = await request<MyReviewCountResponse>(
    '/api/v1/reviews/me/count',
  )

  return {
    myReviewCount: response?.reviewCount ?? 0,
  }
}
