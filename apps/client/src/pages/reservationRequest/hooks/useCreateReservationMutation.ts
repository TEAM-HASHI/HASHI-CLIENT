import { showToast } from '@hashi/hds-ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { pointQueryKeys } from '@/features/point/queries/pointQueryKeys'
import { myReservationsQueryKeys } from '@/features/reservation'
import { captureError } from '@/shared/lib/sentry'
import { createReservation } from '@/pages/reservationRequest/api/createReservation'

export const useCreateReservationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createReservation,
    onError: (error) => {
      captureError(error)
      showToast({
        children: '예약 요청 중 문제가 발생했어요. 다시 시도해주세요.',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pointQueryKeys.myBalance(),
      })
      queryClient.invalidateQueries({
        queryKey: myReservationsQueryKeys.all,
      })
    },
  })
}
