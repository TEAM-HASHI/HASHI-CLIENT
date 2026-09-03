import { useMutation, useQueryClient } from '@tanstack/react-query'

import { restaurantDetailQueryKeys } from '@/features/restaurantDetail/queries/restaurantDetailQueryKeys'
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
  restaurantId?: number
}

export const submitReview = async ({
  content,
  keywordCodes,
  photoFiles,
  rating,
  reservationId,
}: SubmitReviewVariables) => {
  const imageFileKeys = await uploadReviewImages(photoFiles)

  return createReview({
    content,
    imageFileKeys,
    keywordCodes,
    rating,
    reservationId,
  })
}

export const useSubmitReviewMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitReview,
    onSuccess: (_, variables) => {
      const invalidateTasks = [
        queryClient.invalidateQueries({
          queryKey: reviewNewQueryKeys.context(variables.reservationId),
          refetchType: 'none',
        }),
        queryClient.invalidateQueries({ queryKey: myReviewQueryKeys.count() }),
        queryClient.invalidateQueries({ queryKey: myReviewQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: visitedReservationQueryKeys.all,
        }),
      ]

      if (variables.restaurantId !== undefined) {
        invalidateTasks.push(
          queryClient.invalidateQueries({
            queryKey: restaurantDetailQueryKeys.detail(variables.restaurantId),
          }),
        )
      }

      return Promise.all(invalidateTasks)
    },
  })
}
