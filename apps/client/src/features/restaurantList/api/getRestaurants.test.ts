import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getRestaurants } from '@/features/restaurantList/api/getRestaurants'

const { mockRequest } = vi.hoisted(() => ({
  mockRequest: vi.fn(),
}))

vi.mock('@/shared/api', () => ({
  request: mockRequest,
}))

describe('getRestaurants', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('requests restaurants with list API params', async () => {
    mockRequest.mockResolvedValue({
      content: [
        {
          restaurantId: 1,
          name: '스시 하시',
          rating: 4.7,
          thumbnailUrl: 'https://example.com/sushi.jpg',
          genre: '스시/사시미류',
          summary: '스시 전문점',
          hashtags: ['스시'],
        },
      ],
      hasNext: false,
    })

    await expect(
      getRestaurants({
        genre: 'all',
        keyword: '스시',
        size: 20,
      }),
    ).resolves.toEqual({
      restaurants: [
        {
          restaurantId: 1,
          name: '스시 하시',
          rating: 4.7,
          thumbnailUrl: 'https://example.com/sushi.jpg',
          genre: '스시/사시미류',
          summary: '스시 전문점',
          hashtags: ['스시'],
        },
      ],
      hasNext: false,
      nextCursor: undefined,
    })

    expect(mockRequest).toHaveBeenCalledWith('/api/v1/restaurants', {
      searchParams: {
        genre: 'all',
        keyword: '스시',
        size: 20,
      },
    })
  })

  it('normalizes nullable list response fields to an empty result', async () => {
    mockRequest.mockResolvedValue(null)

    await expect(getRestaurants({ type: 'sns-hot' })).resolves.toEqual({
      restaurants: [],
      hasNext: false,
      nextCursor: undefined,
    })
  })
})
