import { describe, expect, it } from 'vitest'

import {
  toWritableReview,
  toWrittenReview,
} from '@/pages/myReviews/utils/myReviewViewModel'

describe('myReviewViewModel', () => {
  it('maps a visited reservation to a writable review card', () => {
    expect(
      toWritableReview({
        adultCount: 2,
        childCount: 1,
        reservationId: 23,
        restaurantId: 7,
        restaurantName: '아키토리 라멘',
        restaurantThumbnailUrl: 'https://cdn.hashi.kr/restaurant.jpg',
        teenCount: 1,
        visitedAt: '2026-06-28T19:00:00+09:00',
      }),
    ).toEqual({
      guestSummary: '어른 2명 · 청소년 1명 · 어린이 1명',
      id: '23',
      reservationId: '23',
      restaurantId: '7',
      restaurantName: '아키토리 라멘',
      thumbnailUrl: 'https://cdn.hashi.kr/restaurant.jpg',
      visitedAt: '2026. 6. 28 19:00 방문',
    })
  })

  it('maps a review summary to a written review card', () => {
    expect(
      toWrittenReview({
        rating: 5,
        reviewId: 31,
        restaurantName: '하시 스시',
        restaurantThumbnailUrl: 'https://cdn.hashi.kr/review.jpg',
        visitedAt: '2026-06-22T17:00:00+09:00',
      }),
    ).toEqual({
      id: '31',
      rating: 5,
      restaurantName: '하시 스시',
      thumbnailUrl: 'https://cdn.hashi.kr/review.jpg',
      visitedAt: '2026. 6. 22 17:00 방문',
    })
  })
})
