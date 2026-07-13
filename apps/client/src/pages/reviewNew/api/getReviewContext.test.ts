import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getReviewContext } from '@/pages/reviewNew/api/getReviewContext'

const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn(),
}))

vi.mock('@/shared/api/request', () => ({
  request: requestMock,
}))

beforeEach(() => {
  requestMock.mockReset()
})

describe('getReviewContext', () => {
  it('gets review context with the reservation id query parameter', async () => {
    const context = {
      reservationId: 23,
      restaurantId: 1,
      restaurantName: '하시 식당',
      reviewable: true,
      reviewKeywordOptions: [
        { code: 'FOOD_IS_DELICIOUS', label: '음식이 맛있어요' },
      ],
    }
    requestMock.mockResolvedValue(context)

    await expect(getReviewContext(23)).resolves.toEqual(context)
    expect(requestMock).toHaveBeenCalledWith(
      '/api/v1/reviews/context?reservationId=23',
    )
  })

  it('rejects an empty context response', async () => {
    requestMock.mockResolvedValue(null)

    await expect(getReviewContext(23)).rejects.toThrow(
      '리뷰 작성 정보를 불러오지 못했습니다.',
    )
  })
})
