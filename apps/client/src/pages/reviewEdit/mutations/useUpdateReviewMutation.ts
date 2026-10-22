import { useMutation, useQueryClient } from '@tanstack/react-query'

import { restaurantDetailQueryKeys } from '@/features/restaurantDetail/queries/restaurantDetailQueryKeys'
import { restaurantPhotoQueryKeys } from '@/features/restaurantDetail/queries/restaurantPhotoQueryOptions'
import { uploadReviewImages } from '@/features/review/api/uploadReviewImages'
import { myReviewQueryKeys } from '@/features/review/queries/myReviewQueryKeys'
import {
  updateReview,
  type UpdateReviewBody,
} from '@/pages/reviewEdit/api/updateReview'

export interface UpdateReviewVariables extends Omit<
  UpdateReviewBody,
  'imageFileKeys'
> {
  reviewId: number
  restaurantId?: number
  existingImageFileKeys: string[]
  photoFiles: File[]
}

export const submitReviewUpdate = async ({
  reviewId,
  rating,
  keywordCodes,
  content,
  existingImageFileKeys,
  photoFiles,
}: UpdateReviewVariables) => {
  const uploadedImageFileKeys = await uploadReviewImages(photoFiles)

  await updateReview(reviewId, {
    rating,
    keywordCodes,
    content,
    imageFileKeys: [...existingImageFileKeys, ...uploadedImageFileKeys],
  })
}

export const useUpdateReviewMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitReviewUpdate,
    onSuccess: (_, variables) => {
      const invalidateTasks = [
        queryClient.invalidateQueries({
          queryKey: myReviewQueryKeys.detail(variables.reviewId),
          refetchType: 'all',
        }),
        queryClient.invalidateQueries({
          queryKey: myReviewQueryKeys.editContext(variables.reviewId),
          refetchType: 'all',
        }),
        queryClient.invalidateQueries({ queryKey: myReviewQueryKeys.lists() }),
      ]

      if (variables.restaurantId !== undefined) {
        invalidateTasks.push(
          queryClient.invalidateQueries({
            queryKey: restaurantDetailQueryKeys.detail(variables.restaurantId),
          }),
          queryClient.invalidateQueries({
            queryKey: restaurantPhotoQueryKeys.restaurant(
              variables.restaurantId,
            ),
          }),
        )
      }

      return Promise.all(invalidateTasks)
    },
  })
}
