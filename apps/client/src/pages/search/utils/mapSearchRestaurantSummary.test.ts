import { describe, expect, it } from 'vitest'

import { mapSearchRestaurantSummary } from '@/pages/search/utils/mapSearchRestaurantSummary'

describe('mapSearchRestaurantSummary', () => {
  it('maps restaurant summary fields to search result view data', () => {
    expect(
      mapSearchRestaurantSummary({
        restaurantId: 8,
        name: '[DEV] 히마와리 스시',
        rating: 5,
        thumbnailUrl: 'https://example.com/himawari.jpg',
        area: '도쿄',
        genre: '스시/사시미류',
        foodCategory: '초밥',
        summary: '제철 생선을 사용하는 스시 전문점',
        hashtags: ['오마카세', '데이트'],
      }),
    ).toMatchObject({
      businessHours: '제철 생선을 사용하는 스시 전문점',
      category: 'sushiSashimi',
      id: '8',
      imageUrl: 'https://example.com/himawari.jpg',
      name: '[DEV] 히마와리 스시',
      rating: 5,
      tag: '오마카세',
    })
  })

  it('maps nullable restaurant summary fields to search result fallback data', () => {
    expect(
      mapSearchRestaurantSummary({
        restaurantId: 7,
        name: '라멘 하시',
        rating: 4.2,
        genre: 'noodle',
        summary: '라멘 전문점',
        hashtags: [],
      }),
    ).toEqual({
      businessHours: '라멘 전문점',
      category: 'noodle',
      id: '7',
      imageUrl: undefined,
      keywords: ['라멘 하시', 'noodle', '라멘 전문점'],
      name: '라멘 하시',
      popularity: 0,
      rating: 4.2,
      tag: 'noodle',
    })
  })
})
