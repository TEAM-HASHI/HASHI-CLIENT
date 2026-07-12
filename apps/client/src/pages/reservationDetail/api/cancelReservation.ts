import type { components } from '@/shared/api/generated/openapi'
import { requestSuccessResponse } from '@/shared/api'

export type CancelReservationResponse =
  components['schemas']['ReservationResponse']

export const cancelReservation = async (reservationId: number) => {
  const response = await requestSuccessResponse<CancelReservationResponse>(
    `api/v1/reservations/${reservationId}/cancel`,
    { method: 'post' },
  )

  if (!response.data) {
    throw new Error('Cancel reservation response data is empty')
  }

  return {
    message: response.message,
    reservation: response.data,
  }
}
