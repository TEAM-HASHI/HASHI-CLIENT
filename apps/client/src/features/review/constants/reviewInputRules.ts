export const REVIEW_TEXT_MIN_LENGTH = 10
export const REVIEW_TEXT_MAX_LENGTH = 1000
export const REVIEW_KEYWORD_MIN_SELECTED_COUNT = 1
export const REVIEW_KEYWORD_MAX_SELECTED_COUNT = 3
export const REVIEW_PHOTO_MAX_COUNT = 10
export const REVIEW_PHOTO_MAX_SIZE_BYTES = 5 * 1024 * 1024
export const REVIEW_PHOTO_ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const
export const REVIEW_PHOTO_ACCEPT = REVIEW_PHOTO_ACCEPTED_MIME_TYPES.join(',')
export const REVIEW_PHOTO_TYPE_ERROR_MESSAGE =
  'JPG, PNG, WEBP 형식의 사진만 첨부할 수 있어요.'
export const REVIEW_PHOTO_SIZE_ERROR_MESSAGE =
  '사진은 장당 5MB 이하로 첨부해주세요.'
export const REVIEW_PHOTO_MAX_COUNT_ERROR_MESSAGE =
  '사진은 최대 10장까지 첨부할 수 있어요.'
