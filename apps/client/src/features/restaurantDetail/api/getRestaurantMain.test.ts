import { beforeEach, describe, expect, it, vi } from 'vitest'

import { request } from '@/shared/api/request'

import { getRestaurantMain } from '@/features/restaurantDetail/api/getRestaurantMain'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockedRequest = vi.mocked(request)

describe('getRestaurantMain', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
  })

  it('maps the restaurant summary response used by reservation and detail pages', async () => {
    mockedRequest.mockResolvedValue({
      restaurantId: 10,
      name: '하시 스시',
      localName: 'HASHI SUSHI',
      rating: 4.7,
      reviewCount: 120,
      summary: '긴자에서 즐기는 오마카세',
      foodCategory: 'SUSHI',
      address: '도쿄도 주오구 긴자 1-1',
      thumbnailUrl: 'https://example.com/thumbnail.webp',
      imageUrls: [
        'https://example.com/restaurant-1.webp',
        'https://example.com/restaurant-2.webp',
      ],
      reservationFee: 4_000,
    })

    await expect(getRestaurantMain(10)).resolves.toEqual({
      restaurantId: 10,
      name: '하시 스시',
      localName: 'HASHI SUSHI',
      rating: 4.7,
      reviewCount: 120,
      summary: '긴자에서 즐기는 오마카세',
      foodCategory: 'SUSHI',
      address: '도쿄도 주오구 긴자 1-1',
      thumbnailUrl: 'https://example.com/thumbnail.webp',
      imageUrls: [
        'https://example.com/restaurant-1.webp',
        'https://example.com/restaurant-2.webp',
      ],
      reservationFee: 4_000,
    })
    expect(mockedRequest).toHaveBeenCalledWith('/api/v1/restaurants/10/summary')
  })

  it('rejects a response missing fields required by the reservation flow', async () => {
    mockedRequest.mockResolvedValue({
      restaurantId: 10,
      name: '하시 스시',
      localName: 'HASHI SUSHI',
      rating: 4.7,
      reviewCount: 120,
      summary: '긴자에서 즐기는 오마카세',
      foodCategory: 'SUSHI',
      address: undefined,
      thumbnailUrl: null,
      imageUrls: [],
      reservationFee: 4_000,
    })

    await expect(getRestaurantMain(10)).rejects.toThrow(
      '식당 요약 응답에 필수 정보가 없습니다.',
    )
  })
})
