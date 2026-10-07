import { describe, expect, it } from 'vitest'

import { collectionMocks } from '@/pages/saved/data/collectionMocks'
import {
  selectCollections,
  selectRestaurants,
} from '@/pages/saved/utils/collectionSelectors'

describe('collection selectors', () => {
  it('orders collections by creation without mutating data', () => {
    const input = [...collectionMocks.collections].reverse()
    const before = [...input]
    const result = selectCollections(input)
    expect(result[0].id).toBe('spring')
    expect(input).toEqual(before)
  })

  it('excludes hidden, deleted and missing restaurants from counts and lists', () => {
    const collection = collectionMocks.collections[0]
    const result = selectRestaurants(collection, collectionMocks.restaurants)
    expect(result).toHaveLength(4)
    expect(result.every((item) => item.visibility === 'visible')).toBe(true)
  })

  it('sorts latest, rating and reviews independently of category', () => {
    const collection = collectionMocks.collections[0]
    const restaurants = collectionMocks.restaurants
    expect(selectRestaurants(collection, restaurants)[0].id).toBe('sushi')
    expect(selectRestaurants(collection, restaurants, 'rating')[0].id).toBe(
      'cafe',
    )
    expect(selectRestaurants(collection, restaurants, 'reviews')[0].id).toBe(
      'bar',
    )
    for (const category of ['restaurant', 'cafe', 'bar'] as const) {
      const result = selectRestaurants(
        collection,
        restaurants,
        'rating',
        category,
      )
      expect(result.length).toBeGreaterThan(0)
      expect(result.every((item) => item.category === category)).toBe(true)
    }
  })

  it('handles empty collections and does not modify the source ordering', () => {
    const collection = collectionMocks.collections[0]
    const original = [...collection.restaurants]
    expect(
      selectRestaurants(
        { ...collection, restaurants: [] },
        collectionMocks.restaurants,
      ),
    ).toEqual([])
    selectRestaurants(collection, collectionMocks.restaurants, 'reviews')
    expect(collection.restaurants).toEqual(original)
  })
})
