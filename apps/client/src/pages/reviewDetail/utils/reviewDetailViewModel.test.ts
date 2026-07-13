import { describe, expect, it } from 'vitest'

import { toReviewDetail } from '@/pages/reviewDetail/utils/reviewDetailViewModel'

describe('toReviewDetail', () => {
  it('maps the API detail response to the published detail view', () => {
    expect(
      toReviewDetail({
        adultCount: 2,
        childCount: 1,
        content: '정말 맛있습니다. 다음에도 방문하고 싶어요.',
        createdAt: '2026-07-12T13:11:01.19277',
        imageUrls: ['https://cdn.hashi.kr/review-1.jpg'],
        keywords: ['음식이 맛있어요', '직원분이 친절해요', '알 수 없는 값'],
        rating: 4,
        reviewId: 5,
        restaurantName: '아키토리 라멘',
        restaurantThumbnailUrl: 'https://cdn.hashi.kr/restaurant.jpg',
        visitedAt: '2026-06-12T18:30:00',
      }),
    ).toEqual({
      content: '정말 맛있습니다. 다음에도 방문하고 싶어요.',
      guestSummary: '어른 2명 · 어린이 1명',
      id: '5',
      images: [
        {
          alt: '아키토리 라멘 리뷰 사진 1',
          id: 'review-5-image-1',
          src: 'https://cdn.hashi.kr/review-1.jpg',
        },
      ],
      keywordIds: ['delicious', 'kind'],
      rating: 4,
      restaurantName: '아키토리 라멘',
      thumbnailSrc: 'https://cdn.hashi.kr/restaurant.jpg',
      visitedAt: '2026. 6. 12 18:30 방문',
      writtenDate: '2026.07.12',
    })
  })
})
