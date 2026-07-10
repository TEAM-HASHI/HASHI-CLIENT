import {
  REVIEW_KEYWORD_MAX_SELECTED_COUNT,
  REVIEW_KEYWORD_MIN_SELECTED_COUNT,
  REVIEW_PHOTO_MAX_COUNT,
  REVIEW_PHOTO_MAX_SIZE_BYTES,
  REVIEW_TEXT_MAX_LENGTH,
  REVIEW_TEXT_MIN_LENGTH,
} from '@/features/review/constants'

export const checkIsValidReviewRating = (rating: number) => rating > 0

export const checkIsValidReviewKeywordSelection = (
  selectedKeywordIds: string[],
) =>
  selectedKeywordIds.length >= REVIEW_KEYWORD_MIN_SELECTED_COUNT &&
  selectedKeywordIds.length <= REVIEW_KEYWORD_MAX_SELECTED_COUNT

export const checkIsValidReviewText = (reviewText: string) =>
  reviewText.length >= REVIEW_TEXT_MIN_LENGTH &&
  reviewText.length <= REVIEW_TEXT_MAX_LENGTH

export const checkIsValidReviewPhotoFile = (photoFile: File) =>
  photoFile.size <= REVIEW_PHOTO_MAX_SIZE_BYTES

export const checkIsValidReviewPhotoFiles = (photoFiles: File[]) =>
  photoFiles.length <= REVIEW_PHOTO_MAX_COUNT &&
  photoFiles.every(checkIsValidReviewPhotoFile)
