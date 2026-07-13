import { describe, expect, it } from 'vitest'

import { mapRestaurantSummaryToRestaurant } from '@/features/restaurantList/utils/mapRestaurantSummaryToRestaurant'

describe('mapRestaurantSummaryToRestaurant', () => {
  it('maps restaurant list response fields to restaurant card data', () => {
    expect(
      mapRestaurantSummaryToRestaurant({
        area: '도쿄',
        foodCategory: '초밥',
        hashtags: ['오마카세', '#데이트'],
        imageUrls: [
          'https://example.com/restaurant-1.jpg',
          'https://example.com/restaurant-2.jpg',
        ],
        name: '스시 하시',
        rating: 4.8,
        restaurantId: 10,
        summary: '제철 생선을 사용하는 스시 전문점',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
      }),
    ).toEqual({
      category: '초밥',
      description: '제철 생선을 사용하는 스시 전문점',
      hashtags: ['#오마카세', '#데이트'],
      id: '10',
      images: [
        'https://example.com/restaurant-1.jpg',
        'https://example.com/restaurant-2.jpg',
      ],
      name: '스시 하시',
      rating: 4.8,
      region: '도쿄',
    })
  })

  it('uses thumbnail and generated type fallbacks for optional response fields', () => {
    expect(
      mapRestaurantSummaryToRestaurant({
        genre: 'rice-bowl',
        restaurantId: 11,
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
      }),
    ).toEqual({
      category: '덮밥류',
      description: '',
      hashtags: [],
      id: '11',
      images: ['https://example.com/thumbnail.jpg'],
      name: '이름 없는 식당',
      rating: 0,
      region: '',
    })
  })

  it('drops restaurants without restaurantId because detail links require it', () => {
    expect(
      mapRestaurantSummaryToRestaurant({
        name: '식별자 없는 식당',
      }),
    ).toBeNull()
  })
})
