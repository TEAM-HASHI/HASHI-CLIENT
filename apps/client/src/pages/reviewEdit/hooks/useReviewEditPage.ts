import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { useReviewForm } from '@/features/review/hooks'
import { useMyReviewDetailQuery } from '@/features/review/queries/useMyReviewDetailQuery'
import { toReviewEditViewModel } from '@/pages/reviewEdit/utils/reviewEditViewModel'

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
  const reviewDetailQuery = useMyReviewDetailQuery(validReviewId)
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
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const initializedReviewIdRef = useRef<number | null>(null)
  const reviewEdit = useMemo(
    () =>
      reviewDetailQuery.data
        ? toReviewEditViewModel(reviewDetailQuery.data)
        : undefined,
    [reviewDetailQuery.data],
  )

  useEffect(() => {
    if (
      validReviewId === null ||
      !reviewEdit ||
      initializedReviewIdRef.current === validReviewId
    ) {
      return
    }

    handleRatingChange(reviewEdit.rating)
    handleSelectedKeywordIdsChange(reviewEdit.selectedKeywordIds)
    handleReviewTextChange(reviewEdit.reviewText)
    setPhotoUrls(reviewEdit.photoUrls)
    initializedReviewIdRef.current = validReviewId
  }, [
    handleRatingChange,
    handleReviewTextChange,
    handleSelectedKeywordIdsChange,
    reviewEdit,
    validReviewId,
  ])

  const handleBackClick = () => {
    navigate(-1)
  }

  const handleInvalidReviewIdBackClick = () => {
    navigate(WRITTEN_REVIEWS_LOCATION)
  }

  const handleRetryClick = () => {
    void reviewDetailQuery.refetch()
  }

  return {
    isError: validReviewId === null || reviewDetailQuery.isError || !reviewEdit,
    isInvalidReviewId: validReviewId === null,
    isPending: validReviewId !== null && reviewDetailQuery.isPending,
    isSaveDisabled: !canSubmitReview,
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
    handleRatingChange,
    handleRetryClick,
    handleReviewTextChange,
    handleSelectedKeywordIdsChange,
    setPhotoUrls,
  }
}
