import { useMutation, useQueryClient } from '@tanstack/react-query'

import { myReviewQueryKeys } from '@/features/review/queries/myReviewQueryKeys'
import { visitedReservationQueryKeys } from '@/features/review/queries/visitedReservationQueryKeys'
import {
  createReview,
  type CreateReviewBody,
} from '@/pages/reviewNew/api/createReview'
import { uploadReviewImages } from '@/pages/reviewNew/api/uploadReviewImages'
import { reviewNewQueryKeys } from '@/pages/reviewNew/queries/reviewNewQueryKeys'

export interface SubmitReviewVariables extends Omit<
  CreateReviewBody,
  'imageFileKeys'
> {
  photoFiles: File[]
}

export const submitReview = async ({
  photoFiles,
  ...reviewBody
}: SubmitReviewVariables) => {
  const imageFileKeys = await uploadReviewImages(photoFiles)

  return createReview({
    ...reviewBody,
    imageFileKeys,
  })
}

export const useSubmitReviewMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitReview,
    onSuccess: (_, variables) => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: reviewNewQueryKeys.context(variables.reservationId),
          refetchType: 'none',
        }),
        queryClient.invalidateQueries({ queryKey: myReviewQueryKeys.count() }),
        queryClient.invalidateQueries({ queryKey: myReviewQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: visitedReservationQueryKeys.all,
        }),
      ])
    },
  })
}
