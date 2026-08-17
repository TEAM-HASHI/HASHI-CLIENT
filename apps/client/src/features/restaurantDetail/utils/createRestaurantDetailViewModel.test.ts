import { describe, expect, it } from 'vitest'

import type { RestaurantStoreInformation } from '@/features/restaurantDetail/api/getRestaurantStoreInformation'
import type { RestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import { createRestaurantDetailViewModel } from '@/features/restaurantDetail/utils/createRestaurantDetailViewModel'

const restaurantSummary: RestaurantSummary = {
  restaurantId: 10,
  name: '하시 식당',
  localName: 'Hashi Restaurant',
  address: '도쿄도 시부야구',
  imageUrls: ['https://example.com/restaurant.webp'],
  reservationFee: 4000,
  rating: 4.5,
  reviewCount: 12,
  summary: '테스트 식당입니다.',
}

const storeInformation: RestaurantStoreInformation = {
  restaurantId: 10,
  description: '매장 설명',
  businessHours: [
    {
      dayOfWeek: 'MONDAY',
      openTime: '11:00',
      closeTime: '21:00',
      breakStart: '15:00',
      breakEnd: '17:00',
      closed: false,
    },
    {
      dayOfWeek: 'TUESDAY',
      openTime: '12:00',
      closeTime: '20:00',
      closed: false,
    },
  ],
  priceRange: {
    currency: 'JPY',
    minPrice: 1000,
    maxPrice: 3000,
  },
}

describe('createRestaurantDetailViewModel', () => {
  it('uses the injected date for today business hours and last order time', () => {
    const restaurant = createRestaurantDetailViewModel({
      summary: restaurantSummary,
      storeInformation,
      menus: [],
      reviews: [],
      now: new Date('2026-08-17T09:00:00+09:00'),
    })

    expect(restaurant.businessHoursSummary).toBe('8/17 (월) 11:00 ~ 21:00')
    expect(restaurant.lastOrderTime).toBe('21:00')
  })

  it('changes today business hours from the injected date instead of the real current date', () => {
    const restaurant = createRestaurantDetailViewModel({
      summary: restaurantSummary,
      storeInformation,
      menus: [],
      reviews: [],
      now: new Date('2026-08-18T09:00:00+09:00'),
    })

    expect(restaurant.businessHoursSummary).toBe('8/18 (화) 12:00 ~ 20:00')
    expect(restaurant.lastOrderTime).toBe('20:00')
  })

  it('uses the injected date for closed day summary', () => {
    const restaurant = createRestaurantDetailViewModel({
      summary: restaurantSummary,
      storeInformation: {
        ...storeInformation,
        businessHours: [
          {
            dayOfWeek: 'MONDAY',
            closed: true,
          },
        ],
      },
      menus: [],
      reviews: [],
      now: new Date('2026-08-17T09:00:00+09:00'),
    })

    expect(restaurant.businessHoursSummary).toBe('8/17 (월) 휴무')
    expect(restaurant.lastOrderTime).toBe('영업시간 정보 없음')
  })
})
