import { describe, expect, it } from 'vitest'

import {
  getSavedRestaurantRequestParams,
  mapCollectionDetail,
  mapCollectionSummary,
  mapSavedRestaurant,
} from '@/features/collection/utils/collectionReadAdapters'

describe('collection read adapters', () => {
  it('converts UI sort/category values without sending all or reviews', () => {
    expect(
      getSavedRestaurantRequestParams({
        sort: 'reviews',
        category: 'all',
        size: 10,
      }),
    ).toEqual({ sort: 'review', size: 10 })
    expect(
      getSavedRestaurantRequestParams({ sort: 'rating', category: 'cafe' }),
    ).toEqual({ sort: 'rating', placeType: 'cafe' })
    expect(getSavedRestaurantRequestParams()).toEqual({ sort: 'latest' })
  })

  it('maps only available summary fields and fills documented image slots', () => {
    expect(
      mapCollectionSummary({
        collectionId: 8,
        name: 'trip',
        color: 'red',
        visibility: 'private',
        savedCount: 23,
        cover: { imageUrls: ['one'] },
      }),
    ).toEqual({
      id: '8',
      name: 'trip',
      color: 'red',
      isPublic: false,
      savedCount: 23,
      saved: undefined,
      coverImages: ['one', null, null],
    })
  })

  it('preserves absent values rather than fabricating a complete mock collection', () => {
    const summary = mapCollectionSummary({ collectionId: 8 })
    expect(summary.isPublic).toBeUndefined()
    expect(summary.savedCount).toBeUndefined()
    expect(summary).not.toHaveProperty('restaurants')
    expect(summary).not.toHaveProperty('createdAt')
    expect(summary).not.toHaveProperty('description')
    const detail = mapCollectionDetail({
      collectionId: 8,
      visibility: 'public',
      owner: true,
      description: 'trip',
    })
    expect(detail).toMatchObject({
      id: '8',
      isPublic: true,
      owner: true,
      description: 'trip',
    })
    expect(detail.createdAt).toBeUndefined()
  })

  it('keeps missing restaurant fields absent, including the rating', () => {
    const restaurant = mapSavedRestaurant({ restaurantId: 5 })
    expect(restaurant).toMatchObject({ id: '5' })
    expect(restaurant.rating).toBeUndefined()
    expect(restaurant.region).toBeUndefined()
    expect(restaurant.cuisine).toBeUndefined()
    expect(restaurant.image).toBeUndefined()
    expect(restaurant).not.toHaveProperty('visibility')
  })

  it('maps card fields and retains structured image information', () => {
    const image = { status: 'PROCESSING' as const }
    expect(
      mapSavedRestaurant({
        restaurantId: 5,
        rating: 4.8,
        reviewCount: 12,
        area: 'Tokyo',
        foodCategory: 'sushi',
        placeType: 'restaurant',
        thumbnailUrl: 'one',
        thumbnailImage: image,
        savedAt: '2026-10-16T12:00:00',
      }),
    ).toMatchObject({
      id: '5',
      rating: 4.8,
      reviewCount: 12,
      region: 'Tokyo',
      cuisine: 'sushi',
      category: 'restaurant',
      image: 'one',
      thumbnailImage: image,
      savedAt: '2026-10-16T12:00:00',
    })
  })

  it('rejects missing identity rather than producing undefined IDs', () => {
    expect(() => mapCollectionSummary({})).toThrow('collectionId')
    expect(() => mapCollectionDetail({})).toThrow('collectionId')
    expect(() => mapSavedRestaurant({})).toThrow('restaurantId')
  })
})
