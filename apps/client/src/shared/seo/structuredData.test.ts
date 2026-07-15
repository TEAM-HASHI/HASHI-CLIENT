import { describe, expect, it } from 'vitest'

import {
  createHomeStructuredData,
  createRestaurantStructuredData,
} from '@/shared/seo/structuredData'

describe('SEO structured data', () => {
  it('describes HASHI as a website and organization', () => {
    expect(createHomeStructuredData()).toEqual([
      expect.objectContaining({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'HASHI',
        url: 'https://www.hashi.kr/',
      }),
      expect.objectContaining({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'HASHI',
        url: 'https://www.hashi.kr/',
      }),
    ])
  })

  it('describes only verified restaurant fields', () => {
    const structuredData = createRestaurantStructuredData({
      address: '東京都中央区銀座1-1-1',
      description: '에도마에 스시를 선보이는 식당',
      imageUrls: ['https://cdn.hashi.kr/restaurant.jpg'],
      name: '하시 스시',
      restaurantId: 12,
    })

    expect(structuredData).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '東京都中央区銀座1-1-1',
      },
      description: '에도마에 스시를 선보이는 식당',
      image: ['https://cdn.hashi.kr/restaurant.jpg'],
      name: '하시 스시',
      url: 'https://www.hashi.kr/restaurants/12',
    })
    expect(structuredData).not.toHaveProperty('aggregateRating')
    expect(structuredData).not.toHaveProperty('priceRange')
  })
})
