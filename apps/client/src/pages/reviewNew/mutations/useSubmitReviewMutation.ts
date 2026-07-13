import { useMutation, useQueryClient } from '@tanstack/react-query'

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
      return queryClient.invalidateQueries({
        queryKey: reviewNewQueryKeys.context(variables.reservationId),
        refetchType: 'none',
      })
    },
  })
}
