import type { ReservationDetailResponse } from '@/features/reservation/api/getReservationDetail'

export const checkIsReservationDetailBlockedStatus = (
  reservationStatus: ReservationDetailResponse['reservationStatus'],
) => reservationStatus === 'CANCELED'
