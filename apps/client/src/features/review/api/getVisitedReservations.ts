import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api'

export type VisitedReservationListData =
  components['schemas']['VisitedReservationListResponse']
export type VisitedReservation =
  components['schemas']['VisitedReservationResponse']

export interface VisitedReservationParams {
  cursor?: number
  restaurantId?: number
  reviewStatus: 'all' | 'reviewed' | 'unreviewed'
  size: number
  sort?: 'oldest'
}

export type VisitedReservationFilters = Omit<VisitedReservationParams, 'cursor'>

export const getVisitedReservations = async ({
  cursor,
  restaurantId,
  reviewStatus,
  size,
  sort,
}: VisitedReservationParams): Promise<VisitedReservationListData> => {
  const data = await request<VisitedReservationListData>(
    'api/v1/reviews/visited-reservations',
    {
      searchParams: {
        cursor,
        restaurantId,
        reviewStatus,
        size,
        sort,
      },
    },
  )

  if (data === null) {
    throw new Error(
      'Missing API response data: GET /api/v1/reviews/visited-reservations',
    )
  }

  return data
}
