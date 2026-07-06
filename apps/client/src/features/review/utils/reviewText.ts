import { REVIEW_TEXT_MIN_LENGTH } from '../constants/reviewInputRules'

export const getReviewTextHelperText = (
  valueLength: number,
  maxLength: number,
  hasStartedValidation: boolean,
) => {
  if (!hasStartedValidation) {
    return '10자 이상'
  }

  if (valueLength > maxLength) {
    return '글자 수 제한을 초과했어요.'
  }

  if (valueLength < REVIEW_TEXT_MIN_LENGTH) {
    return '10자 이상 작성해주세요.'
  }

  return '10자 이상'
}
