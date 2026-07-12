import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getHotSnsRestaurants } from '@/pages/home/api/getHotSnsRestaurants'

const { mockRequest } = vi.hoisted(() => ({
  mockRequest: vi.fn(),
}))

vi.mock('@/shared/api', () => ({
  request: mockRequest,
}))

describe('getHotSnsRestaurants', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('requests five sns hot restaurants', async () => {
    mockRequest.mockResolvedValue({
      content: [
        {
          restaurantId: 3,
          name: '규카츠 하시',
          thumbnailUrl: 'https://example.com/gyukatsu.jpg',
          summary: 'SNS에서 핫한 규카츠',
        },
      ],
    })

    await expect(getHotSnsRestaurants()).resolves.toEqual([
      {
        imageAlt: '규카츠 하시 대표 이미지',
        imageUrl: 'https://example.com/gyukatsu.jpg',
        name: '규카츠 하시',
        restaurantId: '3',
        summary: 'SNS에서 핫한 규카츠',
      },
    ])

    expect(mockRequest).toHaveBeenCalledWith('/api/v1/restaurants', {
      searchParams: {
        size: 5,
        type: 'sns-hot',
      },
    })
  })
})
