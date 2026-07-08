import type { ReviewDetail } from '@/pages/reviewDetail/types'

const reviewImageUrl =
  'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=480&q=80'

export const reviewDetailMockItems: ReviewDetail[] = [
  {
    id: 'review-1',
    restaurantName:
      '야키토리 무사시 제목은 여기까지 그러나 최대길이 이 정도로까지',
    visitedAt: '2026. 6. 22 17:00 방문',
    guestSummary: '어른 2명',
    rating: 4,
    writtenDate: '2026.06.28',
    content:
      '정말 맛있습니다 와우!!! 정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!',
    images: [
      {
        id: 'review-image-1',
        src: reviewImageUrl,
        alt: '야키토리 무사시 리뷰 사진 1',
      },
      {
        id: 'review-image-2',
        src: reviewImageUrl,
        alt: '야키토리 무사시 리뷰 사진 2',
      },
      {
        id: 'review-image-3',
        src: reviewImageUrl,
        alt: '야키토리 무사시 리뷰 사진 3',
      },
    ],
    keywordIds: ['kind', 'fast', 'value'],
  },
]

export const getReviewDetailMock = (reviewId?: string) => {
  return reviewDetailMockItems.find(
    (reviewDetail) => reviewDetail.id === reviewId,
  )
}
