import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

export type MyReservationsApiStatus = 'IN_PROGRESS' | 'UPCOMING' | 'CANCELED'

export type ReservationListResponse =
  components['schemas']['ReservationListResponse'] & {
    totalCount?: number
  }

export type ReservationResponse = components['schemas']['ReservationResponse']

type GetMyReservationsParams = {
  status: MyReservationsApiStatus
  cursor?: number | null
  size: number
}

const EMPTY_RESERVATION_LIST_RESPONSE = {
  reservations: [],
  hasNext: false,
  totalCount: 0,
} satisfies ReservationListResponse

export const getMyReservations = async ({
  status,
  cursor,
  size,
}: GetMyReservationsParams): Promise<ReservationListResponse> => {
  const searchParams = {
    ...(cursor !== undefined && cursor !== null ? { cursor } : {}),
    size,
    status,
  }

  const response = await request<ReservationListResponse>(
    '/api/v1/reservations/me',
    { searchParams },
  )

  return response ?? EMPTY_RESERVATION_LIST_RESPONSE
}
