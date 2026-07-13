import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteReview } from '@/features/review/api/deleteReview'
import { myReviewQueryKeys } from '@/features/review/queries/myReviewQueryKeys'
import { visitedReservationQueryKeys } from '@/features/review/queries/visitedReservationQueryKeys'

export const useDeleteReviewMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: async (_, reviewId) => {
      queryClient.removeQueries({
        exact: true,
        queryKey: myReviewQueryKeys.detail(reviewId),
      })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: myReviewQueryKeys.count() }),
        queryClient.invalidateQueries({ queryKey: myReviewQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: visitedReservationQueryKeys.all,
        }),
      ])
    },
  })
}
