import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api'

export type ReservationDetailResponse =
  components['schemas']['ReservationDetailResponse']

export const getReservationDetail = async (reservationId: number) => {
  const reservationDetail = await request<ReservationDetailResponse>(
    `api/v1/reservations/${reservationId}`,
  )

  if (!reservationDetail) {
    throw new Error('Reservation detail response data is empty')
  }

  return reservationDetail
}
