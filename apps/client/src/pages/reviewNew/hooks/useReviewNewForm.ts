import type { FormEvent } from 'react'
import { useState } from 'react'

import {
  REVIEW_TEXT_MAX_LENGTH,
  type ReviewKeywordId,
} from '@/features/review/constants'
import {
  checkIsValidReviewKeywordSelection,
  checkIsValidReviewPhotoFiles,
  checkIsValidReviewRating,
  checkIsValidReviewText,
} from '@/features/review/utils'

export const useReviewNewForm = () => {
  const [rating, setRating] = useState(0)
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<
    ReviewKeywordId[]
  >([])
  const [reviewText, setReviewText] = useState('')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])

  const canSubmitReview =
    checkIsValidReviewRating(rating) &&
    checkIsValidReviewKeywordSelection(selectedKeywordIds) &&
    checkIsValidReviewText(reviewText) &&
    checkIsValidReviewPhotoFiles(photoFiles)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmitReview) {
      return
    }
  }

  return {
    canSubmitReview,
    handlePhotoFilesChange: setPhotoFiles,
    handleRatingChange: setRating,
    handleReviewTextChange: setReviewText,
    handleSelectedKeywordIdsChange: setSelectedKeywordIds,
    handleSubmit,
    maxReviewTextLength: REVIEW_TEXT_MAX_LENGTH,
    photoFiles,
    rating,
    reviewText,
    selectedKeywordIds,
  }
}
