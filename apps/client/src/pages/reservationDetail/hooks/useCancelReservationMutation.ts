import { useMutation } from '@tanstack/react-query'

import { cancelReservation } from '@/pages/reservationDetail/api/cancelReservation'

export const useCancelReservationMutation = () => {
  return useMutation({
    mutationFn: (reservationId: number) => cancelReservation(reservationId),
  })
}
