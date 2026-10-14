import { REVIEW_TEXT_MIN_LENGTH } from '@/features/review/constants'

export const getReviewTextHelperText = (
  valueLength: number,
  hasStartedValidation: boolean,
) => {
  if (!hasStartedValidation) {
    return '10자 이상'
  }

  if (valueLength < REVIEW_TEXT_MIN_LENGTH) {
    return '10자 이상 작성해주세요.'
  }

  return '10자 이상'
}
