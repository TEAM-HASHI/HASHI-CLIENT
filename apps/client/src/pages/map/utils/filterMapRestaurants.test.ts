import { describe, expect, it } from 'vitest'

import { filterMapRestaurants } from '@/pages/map/utils/filterMapRestaurants'
import type { MapRestaurant } from '@/pages/map/types'

const restaurants: MapRestaurant[] = [
  {
    id: 'a',
    saveCount: 0,
    name: '스시 A',
    areaCode: 'shibuya',
    category: 'restaurant',
    cuisine: '초밥',
    rating: 4.2,
    reviewCount: 90,
    recommendationRank: 1,
    menuKeywords: ['연어'],
    images: [],
    hours: '',
    price: '',
    description: '',
    address: '',
    position: { lat: 50, lng: 40 },
  },
  {
    id: 'b',
    saveCount: 0,
    name: 'Sushi B',
    areaCode: 'shinjuku',
    category: 'restaurant',
    cuisine: '초밥',
    rating: 4.9,
    reviewCount: 20,
    recommendationRank: 2,
    menuKeywords: ['연어'],
    images: [],
    hours: '',
    price: '',
    description: '',
    address: '',
    position: { lat: 30, lng: 30 },
  },
  {
    id: 'c',
    saveCount: 0,
    name: '카페 C',
    areaCode: 'shibuya',
    category: 'cafe',
    cuisine: '커피',
    rating: 4.9,
    reviewCount: 120,
    recommendationRank: 3,
    menuKeywords: ['라떼'],
    images: [],
    hours: '',
    price: '',
    description: '',
    address: '',
    position: { lat: 40, lng: 50 },
  },
]
const base = {
  keyword: '',
  category: 'all',
  areaCode: null,
  sort: 'recommended',
} as const

describe('filterMapRestaurants', () => {
  it('limits results to the applied viewport, including its boundary', () => {
    const located = restaurants.map((restaurant, index) => ({
      ...restaurant,
      position: { lat: 35 + index, lng: 139 + index },
    }))
    expect(
      filterMapRestaurants(located, base, {
        south: 35,
        north: 36,
        west: 139,
        east: 140,
      }).map(({ id }) => id),
    ).toEqual(['a', 'b'])
    expect(
      filterMapRestaurants(located, base, {
        south: 0,
        north: 1,
        west: 0,
        east: 1,
      }),
    ).toEqual([])
  })
  it('intersects keyword, area and category rather than overwriting conditions', () => {
    expect(
      filterMapRestaurants(restaurants, {
        ...base,
        keyword: '연어',
        category: 'restaurant',
        areaCode: 'shibuya',
      }).map(({ id }) => id),
    ).toEqual(['a'])
  })
  it('trims and searches names case-insensitively', () => {
    expect(
      filterMapRestaurants(restaurants, { ...base, keyword: ' SUSHI ' }).map(
        ({ id }) => id,
      ),
    ).toEqual(['b'])
  })
  it('returns an empty list for unmatched input', () => {
    expect(
      filterMapRestaurants(restaurants, { ...base, keyword: '없는 음식' }),
    ).toEqual([])
  })
  it('sorts ratings descending with recommendation order as a stable tie break', () => {
    expect(
      filterMapRestaurants(restaurants, { ...base, sort: 'rating' }).map(
        ({ id }) => id,
      ),
    ).toEqual(['b', 'c', 'a'])
  })
  it('sorts reviews descending without mutating the original records', () => {
    const snapshot = structuredClone(restaurants)
    expect(
      filterMapRestaurants(restaurants, { ...base, sort: 'reviews' }).map(
        ({ id }) => id,
      ),
    ).toEqual(['c', 'a', 'b'])
    expect(restaurants).toEqual(snapshot)
  })
})
