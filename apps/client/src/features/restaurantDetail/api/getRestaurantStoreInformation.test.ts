import { beforeEach, describe, expect, it, vi } from 'vitest'

import { request } from '@/shared/api/request'

import { getRestaurantStoreInformation } from '@/features/restaurantDetail/api/getRestaurantStoreInformation'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockedRequest = vi.mocked(request)

describe('getRestaurantStoreInformation', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
  })

  it('preserves store information and business hours by day', async () => {
    mockedRequest.mockResolvedValue({
      restaurantId: 10,
      description: '긴자역 인근 스시 전문점',
      businessHours: [
        {
          dayOfWeek: 'MONDAY',
          openTime: '11:00',
          closeTime: '20:00',
          breakStart: '15:00',
          breakEnd: '17:00',
          closed: false,
        },
        {
          dayOfWeek: 'TUESDAY',
          openTime: undefined,
          closeTime: undefined,
          breakStart: undefined,
          breakEnd: undefined,
          closed: true,
        },
      ],
      priceRange: {
        currency: 'JPY',
        minPrice: 1_000,
        maxPrice: 3_000,
      },
    })

    await expect(getRestaurantStoreInformation(10)).resolves.toEqual({
      restaurantId: 10,
      description: '긴자역 인근 스시 전문점',
      businessHours: [
        {
          dayOfWeek: 'MONDAY',
          openTime: '11:00',
          closeTime: '20:00',
          breakStart: '15:00',
          breakEnd: '17:00',
          closed: false,
        },
        {
          dayOfWeek: 'TUESDAY',
          openTime: undefined,
          closeTime: undefined,
          breakStart: undefined,
          breakEnd: undefined,
          closed: true,
        },
      ],
      priceRange: {
        currency: 'JPY',
        minPrice: 1_000,
        maxPrice: 3_000,
      },
    })
    expect(mockedRequest).toHaveBeenCalledWith(
      '/api/v1/restaurants/10/store-information',
    )
  })

  it('rejects a response without a matching restaurant id or business hours', async () => {
    mockedRequest.mockResolvedValue({
      restaurantId: undefined,
      description: '긴자역 인근 스시 전문점',
      businessHours: undefined,
      priceRange: {
        currency: 'JPY',
        minPrice: 1_000,
        maxPrice: 3_000,
      },
    })

    await expect(getRestaurantStoreInformation(10)).rejects.toThrow(
      '식당 매장 정보 응답에 필수 정보가 없습니다.',
    )
  })
})
