import { describe, expect, it } from 'vitest'

import { mapSearchRestaurant } from '@/pages/search/utils/mapSearchRestaurant'

describe('mapSearchRestaurant', () => {
  it('maps restaurant list response fields to search result view data', () => {
    const result = mapSearchRestaurant({
      restaurantId: 8,
      name: '[DEV] 히마와리 스시',
      rating: 5,
      thumbnailUrl: 'https://example.com/himawari.jpg',
      area: '도쿄',
      genre: '스시/사시미류',
      foodCategory: '초밥',
      summary: '제철 생선을 사용하는 스시 전문점',
      hashtags: ['오마카세', '데이트'],
    })

    expect(result).toMatchObject({
      businessHours: '영업시간 확인 필요',
      category: 'sushiSashimi',
      id: '8',
      imageUrl: 'https://example.com/himawari.jpg',
      name: '[DEV] 히마와리 스시',
      rating: 5,
      tag: '오마카세',
    })
    expect(result.businessHours).not.toBe('제철 생선을 사용하는 스시 전문점')
  })

  it('maps nullable restaurant list response fields to search result fallback data', () => {
    expect(
      mapSearchRestaurant({
        restaurantId: 7,
        name: '라멘 하시',
        rating: 4.2,
        genre: 'noodle',
        summary: '라멘 전문점',
        hashtags: [],
      }),
    ).toEqual({
      businessHours: '영업시간 확인 필요',
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
