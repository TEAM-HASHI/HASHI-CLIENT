import { useQuery } from '@tanstack/react-query'

import { getReservationDetail } from '@/pages/reservationDetail/api/getReservationDetail'

export const reservationDetailQueryKey = (reservationId: number | null) =>
  ['reservationDetail', reservationId] as const

export const useReservationDetailQuery = (reservationId: number | null) => {
  return useQuery({
    enabled: reservationId !== null,
    queryFn: () => {
      if (reservationId === null) {
        throw new Error('reservationId is required')
      }

      return getReservationDetail(reservationId)
    },
    queryKey: reservationDetailQueryKey(reservationId),
  })
}
