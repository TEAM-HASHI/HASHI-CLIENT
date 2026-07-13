import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

export type MyReviewsData = components['schemas']['MyReviewListResponse']
export type MyReviewSummary = components['schemas']['MyReviewSummaryResponse']

export interface MyReviewsPageParams {
  cursor?: number
  size: number
}

const requireData = <TData>(data: TData | null, endpoint: string): TData => {
  if (data === null) {
    throw new Error(`Missing API response data: ${endpoint}`)
  }

  return data
}

export const getMyReviews = async ({
  cursor,
  size,
}: MyReviewsPageParams): Promise<MyReviewsData> => {
  const data = await request<MyReviewsData>('api/v1/reviews/me', {
    searchParams: {
      ...(cursor !== undefined && { cursor }),
      size,
    },
  })

  return requireData(data, 'GET /api/v1/reviews/me')
}
