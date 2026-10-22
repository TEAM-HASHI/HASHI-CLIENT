import { useEffect, useMemo, useRef, useState } from 'react'
import { generatePath, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { REVIEW_PHOTO_MAX_COUNT } from '@/features/review/constants'
import { useReviewForm } from '@/features/review/hooks'
import { useUpdateReviewMutation } from '@/pages/reviewEdit/mutations/useUpdateReviewMutation'
import { useReviewEditContextQuery } from '@/pages/reviewEdit/queries/useReviewEditContextQuery'
import {
  toReviewEditViewModel,
  type ExistingReviewImage,
} from '@/pages/reviewEdit/utils/reviewEditViewModel'
import { checkIsNotFoundError } from '@/shared/api/apiError'

const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/

const WRITTEN_REVIEWS_LOCATION = {
  pathname: ROUTES.myReviews,
  search: '?tab=written',
}

const parseReviewId = (value: string | undefined) => {
  if (!value || !POSITIVE_INTEGER_PATTERN.test(value)) {
    return null
  }

  const reviewId = Number(value)

  return Number.isSafeInteger(reviewId) ? reviewId : null
}

export const useReviewEditPage = () => {
  const navigate = useNavigate()
  const { reviewId } = useParams()
  const validReviewId = parseReviewId(reviewId)
  const reviewEditContextQuery = useReviewEditContextQuery(validReviewId)
  const updateReviewMutation = useUpdateReviewMutation()
  const {
    canSubmitReview,
    handlePhotoFilesChange,
    handleRatingChange,
    handleReviewTextChange,
    handleSelectedKeywordIdsChange,
    maxReviewTextLength,
    photoFiles,
    rating,
    reviewText,
    selectedKeywordIds,
  } = useReviewForm()
  const [existingImages, setExistingImages] = useState<ExistingReviewImage[]>(
    [],
  )
  const photoUrls = useMemo(
    () => existingImages.map(({ imageUrl }) => imageUrl),
    [existingImages],
  )
  const initializedReviewIdRef = useRef<number | null>(null)
  const reviewEdit = useMemo(
    () =>
      reviewEditContextQuery.data
        ? toReviewEditViewModel(reviewEditContextQuery.data)
        : undefined,
    [reviewEditContextQuery.data],
  )

  useEffect(() => {
    if (
      validReviewId === null ||
      !reviewEdit ||
      reviewEditContextQuery.isFetching ||
      reviewEditContextQuery.isPaused ||
      reviewEditContextQuery.isError ||
      initializedReviewIdRef.current === validReviewId
    ) {
      return
    }

    handleRatingChange(reviewEdit.rating)
    handleSelectedKeywordIdsChange(reviewEdit.selectedKeywordIds)
    handleReviewTextChange(reviewEdit.reviewText)
    handlePhotoFilesChange([])
    setExistingImages(reviewEdit.images)
    initializedReviewIdRef.current = validReviewId
  }, [
    handleRatingChange,
    handleReviewTextChange,
    handleSelectedKeywordIdsChange,
    reviewEdit,
    reviewEditContextQuery.isError,
    reviewEditContextQuery.isFetching,
    reviewEditContextQuery.isPaused,
    validReviewId,
  ])

  const handleBackClick = () => {
    navigate(-1)
  }

  const handleInvalidReviewIdBackClick = () => {
    navigate(WRITTEN_REVIEWS_LOCATION)
  }

  const handleRetryClick = () => {
    void reviewEditContextQuery.refetch()
  }

  const handleSaveClick = () => {
    if (
      validReviewId === null ||
      !reviewEdit ||
      !canSubmitReview ||
      existingImages.length + photoFiles.length > REVIEW_PHOTO_MAX_COUNT ||
      updateReviewMutation.isPending
    ) {
      return
    }

    updateReviewMutation.mutate(
      {
        reviewId: validReviewId,
        restaurantId: reviewEdit.restaurantId,
        rating,
        keywordCodes: selectedKeywordIds,
        content: reviewText,
        existingImageFileKeys: existingImages.map(({ fileKey }) => fileKey),
        photoFiles,
      },
      {
        onSuccess: () => {
          navigate(
            generatePath(ROUTES.reviewDetail, {
              reviewId: String(validReviewId),
            }),
          )
        },
      },
    )
  }

  const handlePhotoUrlDelete = (index: number) => {
    setExistingImages((images) =>
      images.filter((_, imageIndex) => imageIndex !== index),
    )
  }

  return {
    isError:
      validReviewId === null || reviewEditContextQuery.isError || !reviewEdit,
    isInvalidReviewId: validReviewId === null,
    isNotFound: checkIsNotFoundError(reviewEditContextQuery.error),
    isPending:
      validReviewId !== null &&
      (reviewEditContextQuery.isPending ||
        (!reviewEditContextQuery.isError &&
          !!reviewEdit &&
          // eslint-disable-next-line react-hooks/refs
          initializedReviewIdRef.current !== validReviewId)),
    isSaveDisabled:
      !canSubmitReview ||
      existingImages.length + photoFiles.length > REVIEW_PHOTO_MAX_COUNT ||
      updateReviewMutation.isPending,
    isSaving: updateReviewMutation.isPending,
    isSaveError: updateReviewMutation.isError,
    maxReviewTextLength,
    photoFiles,
    photoUrls,
    rating,
    reviewEdit,
    reviewText,
    selectedKeywordIds,
    handleBackClick,
    handleInvalidReviewIdBackClick,
    handlePhotoFilesChange,
    handlePhotoUrlDelete,
    handleRatingChange,
    handleRetryClick,
    handleReviewTextChange,
    handleSaveClick,
    handleSelectedKeywordIdsChange,
  }
}
