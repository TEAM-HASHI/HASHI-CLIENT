import { describe, expect, it } from 'vitest'
import { toRestaurantPrefillView } from '@/pages/restaurants/restaurantViewModel'

describe('toRestaurantPrefillView', () => {
  it('normalizes public detail data without inferring storage keys', () => {
    const view = toRestaurantPrefillView({
      listItem: {
        restaurantId: 12,
        name: '하시 스시',
        area: '시부야',
        genre: 'sushi',
        foodCategory: 'sushi',
        hashtags: ['현지인맛집'],
      },
      summary: {
        restaurantId: 12,
        name: '하시 스시',
        localName: 'ハシ寿司',
        summary: '현지 스시 전문점',
        address: '東京都渋谷区1-1-1',
        imageUrls: ['https://cdn.example/a.webp'],
      },
      storeInformation: {
        description: '제철 생선을 사용합니다.',
        priceRange: { currency: 'JPY', minPrice: 3000, maxPrice: 8000 },
        businessHours: [{ dayOfWeek: 'MONDAY', closed: true }],
      },
      menus: [
        {
          menuId: 1,
          name: '오마카세',
          description: '제철 구성',
          imageUrl: 'https://cdn.example/menu.webp',
          currency: 'JPY',
          price: 8000,
          main: true,
        },
      ],
    })

    expect(view.images).toEqual([
      { sourceUrl: 'https://cdn.example/a.webp', uploaded: null },
    ])
    expect(view.menus[0]?.image).toEqual({
      sourceUrl: 'https://cdn.example/menu.webp',
      uploaded: null,
    })
    expect(view.curationTypes).toEqual([])
    expect(view.genre).toBe('sushi')
    expect(view.foodCategory).toBe('sushi')
  })
})
