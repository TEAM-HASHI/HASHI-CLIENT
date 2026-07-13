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
      todayBusinessHour: {
        date: '2026-07-13',
        dayOfWeek: 'MONDAY',
        openTime: '11:00',
        closeTime: '22:00',
        closed: false,
      },
    })

    expect(result).not.toBeNull()
    expect(result).toMatchObject({
      businessHours: '7/13 (월) 11:00~22:00',
      category: 'sushiSashimi',
      id: '8',
      imageUrl: 'https://example.com/himawari.jpg',
      name: '[DEV] 히마와리 스시',
      rating: 5,
      tag: '오마카세',
    })
    expect(result?.businessHours).not.toBe('제철 생선을 사용하는 스시 전문점')
  })

  it('maps closed today business hour to closed text', () => {
    expect(
      mapSearchRestaurant({
        restaurantId: 9,
        name: '휴무 스시',
        todayBusinessHour: {
          date: '2026-07-14',
          dayOfWeek: 'TUESDAY',
          closed: true,
        },
      }),
    ).toMatchObject({
      businessHours: '7/14 (화) 휴무',
    })
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

  it('drops restaurants without restaurantId because detail links require it', () => {
    expect(
      mapSearchRestaurant({
        name: '식별자 없는 라멘',
        summary: '상세 링크를 만들 수 없는 식당',
      }),
    ).toBeNull()
  })
})
