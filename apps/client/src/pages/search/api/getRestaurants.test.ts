import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getRestaurants } from '@/pages/search/api/getRestaurants'

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

  it('requests restaurants with the current search filters as API params', async () => {
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

    await getRestaurants({
      genre: 'all',
      keyword: '스시',
      size: 20,
    })

    expect(mockRequest).toHaveBeenCalledWith('/api/v1/restaurants', {
      searchParams: {
        genre: 'all',
        keyword: '스시',
        size: 20,
      },
    })
  })

  it('maps current API response fields to search result view data', async () => {
    mockRequest.mockResolvedValue({
      content: [
        {
          restaurantId: 8,
          name: '[DEV] 히마와리 스시',
          rating: 5,
          thumbnailUrl: 'https://example.com/himawari.jpg',
          area: '도쿄',
          genre: '스시/사시미류',
          foodCategory: '초밥',
          summary: '제철 생선을 사용하는 스시 전문점',
          hashtags: ['오마카세', '데이트'],
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
    ).resolves.toMatchObject({
      restaurants: [
        {
          businessHours: '제철 생선을 사용하는 스시 전문점',
          category: 'sushiSashimi',
          id: '8',
          imageUrl: 'https://example.com/himawari.jpg',
          name: '[DEV] 히마와리 스시',
          rating: 5,
          tag: '오마카세',
        },
      ],
    })
  })

  it('maps nullable API fields to search result view data', async () => {
    mockRequest.mockResolvedValue({
      content: [
        {
          restaurantId: 7,
          name: '라멘 하시',
          rating: 4.2,
          thumbnailUrl: null,
          genre: 'noodle',
          summary: '라멘 전문점',
          hashtags: [],
        },
      ],
      hasNext: true,
      nextCursor: '7',
    })

    await expect(
      getRestaurants({
        genre: 'noodle',
        keyword: '라멘',
        size: 20,
        sort: 'popular',
      }),
    ).resolves.toEqual({
      restaurants: [
        {
          businessHours: '라멘 전문점',
          category: 'noodle',
          id: '7',
          imageUrl: undefined,
          keywords: ['라멘 하시', 'noodle', '라멘 전문점'],
          name: '라멘 하시',
          popularity: 0,
          rating: 4.2,
          tag: 'noodle',
        },
      ],
      hasNext: true,
      nextCursor: '7',
    })
  })
})
