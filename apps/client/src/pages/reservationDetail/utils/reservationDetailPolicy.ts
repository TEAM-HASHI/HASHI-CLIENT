import type { ReservationDetailResponse } from '@/pages/reservationDetail/api/getReservationDetail'

export const parseReservationId = (reservationId: string | undefined) => {
  if (!reservationId) {
    return null
  }

  const parsedReservationId = Number(reservationId)

  return Number.isSafeInteger(parsedReservationId) && parsedReservationId > 0
    ? parsedReservationId
    : null
}

export const checkIsReservationDetailBlockedStatus = (
  reservationStatus: ReservationDetailResponse['reservationStatus'],
) => reservationStatus === 'CANCELED'
