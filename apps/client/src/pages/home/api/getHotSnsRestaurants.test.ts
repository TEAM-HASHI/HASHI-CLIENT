import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getHotSnsRestaurants } from '@/pages/home/api/getHotSnsRestaurants'

const { mockGetRestaurants } = vi.hoisted(() => ({
  mockGetRestaurants: vi.fn(),
}))

vi.mock('@/features/restaurantList/api/getRestaurants', () => ({
  getRestaurants: mockGetRestaurants,
}))

describe('getHotSnsRestaurants', () => {
  beforeEach(() => {
    mockGetRestaurants.mockReset()
  })

  it('requests five sns hot restaurants', async () => {
    mockGetRestaurants.mockResolvedValue({
      restaurants: [
        {
          name: '식별자 없는 식당',
          summary: '상세 링크를 만들 수 없는 식당',
        },
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

    expect(mockGetRestaurants).toHaveBeenCalledWith({
      size: 5,
      type: 'sns-hot',
    })
  })
})
