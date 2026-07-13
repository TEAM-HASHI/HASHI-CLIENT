import { useMutation, useQueryClient } from '@tanstack/react-query'

import { pointQueryKeys } from '@/features/point/queries/pointQueryKeys'
import { createReservation } from '@/pages/reservationRequest/api/createReservation'

export const useCreateReservationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createReservation,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: pointQueryKeys.myBalance(),
      }),
  })
}
