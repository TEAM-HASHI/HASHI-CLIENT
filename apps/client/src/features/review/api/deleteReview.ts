import { request } from '@/shared/api/request'

export const deleteReview = (reviewId: number) =>
  request<null>(`api/v1/reviews/${reviewId}`, { method: 'delete' })
