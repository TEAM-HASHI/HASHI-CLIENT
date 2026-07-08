import type {
  WritableReview,
  WrittenReview,
} from '@/pages/myReviews/types/myReview'

const reviewTitle =
  '야키토리 무사시 제목은 여기까지 그러나 최대길이 이 정도로까지'

export const myWritableReviewMocks: WritableReview[] = [
  {
    id: 'writable-review-1',
    restaurantId: '1',
    restaurantName: reviewTitle,
    visitedAt: '2026. 6. 22 17:00 방문',
    guestSummary: '어른 2명',
  },
  {
    id: 'writable-review-2',
    restaurantId: '2',
    restaurantName: reviewTitle,
    visitedAt: '2026. 6. 22 17:00 방문',
    guestSummary: '어른 2명',
  },
]

export const myWrittenReviewMocks: WrittenReview[] = [
  {
    id: 'written-review-1',
    restaurantName: reviewTitle,
    visitedAt: '2026. 6. 22 17:00 방문',
    rating: 5,
  },
  {
    id: 'written-review-2',
    restaurantName: reviewTitle,
    visitedAt: '2026. 6. 22 17:00 방문',
    rating: 5,
  },
  {
    id: 'written-review-3',
    restaurantName: reviewTitle,
    visitedAt: '2026. 6. 22 17:00 방문',
    rating: 5,
  },
  {
    id: 'written-review-4',
    restaurantName: reviewTitle,
    visitedAt: '2026. 6. 22 17:00 방문',
    rating: 5,
  },
]
