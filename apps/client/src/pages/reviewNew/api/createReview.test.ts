import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createReview } from '@/pages/reviewNew/api/createReview'

const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn(),
}))

vi.mock('@/shared/api/request', () => ({
  request: requestMock,
}))

beforeEach(() => {
  requestMock.mockReset()
})

describe('createReview', () => {
  it('posts the review with uploaded image file keys', async () => {
    const body = {
      reservationId: 23,
      rating: 5,
      keywordCodes: ['FOOD_IS_DELICIOUS', 'STAFF_IS_KIND'],
      content: '분위기도 좋고 음식도 정말 맛있었어요.',
      imageFileKeys: ['uploads/reviews/review-image.jpg'],
    }
    const response = { reviewId: 501, earnedPoint: 100 }
    requestMock.mockResolvedValue(response)

    await expect(createReview(body)).resolves.toEqual(response)
    expect(requestMock).toHaveBeenCalledWith('/api/v1/reviews', {
      method: 'post',
      json: body,
    })
  })

  it('rejects a response without a review id', async () => {
    requestMock.mockResolvedValue({ earnedPoint: 100 })

    await expect(
      createReview({
        reservationId: 23,
        rating: 5,
        keywordCodes: ['FOOD_IS_DELICIOUS'],
        content: '분위기도 좋고 음식도 정말 맛있었어요.',
      }),
    ).rejects.toThrow('리뷰 등록 결과를 확인할 수 없습니다.')
  })
})
