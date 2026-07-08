export const MY_REVIEW_TAB_ITEMS = {
  writable: {
    label: '리뷰 쓰기',
    value: 'writable',
  },
  written: {
    label: '작성한 리뷰',
    value: 'written',
  },
} as const

export type MyReviewTabTypes =
  (typeof MY_REVIEW_TAB_ITEMS)[keyof typeof MY_REVIEW_TAB_ITEMS]['value']
