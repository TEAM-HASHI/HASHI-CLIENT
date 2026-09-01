import { showToast } from '@hashi/hds-ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cancelReservation } from '@/features/reservation/api/cancelReservation'
import { syncCanceledReservationCache } from '@/features/reservation/queries/syncCanceledReservationCache'
import { captureError } from '@/shared/lib/sentry'

type CancelReservationResult = Awaited<ReturnType<typeof cancelReservation>>

interface UseCancelReservationMutationParams {
  onCanceled?: (result: CancelReservationResult) => void | Promise<void>
}

export const useCancelReservationMutation = ({
  onCanceled,
}: UseCancelReservationMutationParams = {}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reservationId: number) => cancelReservation(reservationId),
    onSuccess: async (result) => {
      try {
        await onCanceled?.(result)
      } catch (error) {
        captureError(error)
      }

      await syncCanceledReservationCache(queryClient, result.reservation)
      showToast({ children: result.message })
    },
  })
}
