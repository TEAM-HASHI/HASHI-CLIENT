import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMapRegions } from '@/pages/map/api/getMapRegions'
import { getMapRestaurantLocation } from '@/pages/map/api/getMapRestaurantLocation'
import { getMapRestaurants } from '@/pages/map/api/getMapRestaurants'
import type { MapNewQuery, MapPageRequest } from '@/pages/map/api/mapApiTypes'
import { ApiError } from '@/shared/api/apiError'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))

const query: MapNewQuery = {
  south: 35,
  north: 36,
  west: 139,
  east: 140,
  sort: 'recommend',
}
const location = {
  latitude: 35.5,
  longitude: 139.5,
  validUntil: '2027-01-01T00:00:00Z',
  attributions: [{ displayName: 'Provider', uri: 'https://provider.example' }],
}
const card = {
  restaurantId: 2,
  name: '스시 하시',
  rating: 4.2,
  reviewCount: 12,
  placeType: 'restaurant',
  area: '신주쿠',
  genre: 'sushi',
  summary: '식당 소개',
  hashtags: ['스시'],
  imageUrls: ['/legacy.jpg'],
  todayBusinessHour: { closed: false, openTime: '11:00', closeTime: '22:00' },
  priceRange: { currency: 'JPY', minPrice: 1000, maxPrice: 3000 },
  location,
}
const createPage = () => ({
  content: [card, { ...card, restaurantId: 1, rating: 5 }],
  hasNext: true,
  nextCursor: 'opaque-next-cursor',
  querySessionId: '123e4567-e89b-12d3-a456-426614174000',
  expiresAt: '2027-01-01T00:00:00Z',
  rankingAsOf: '2026-10-19T00:00:00Z',
  query,
})
const createRegions = () => ({
  initialBounds: query,
  queryLimits: {
    supportedBounds: { south: 30, north: 40, west: 130, east: 150 },
    maxLatitudeSpan: 1,
    maxLongitudeSpan: 1,
  },
  regions: [
    {
      mapRegionId: 7,
      name: '신주쿠',
      restaurantCount: 0,
      clusterPosition: { latitude: 35.5, longitude: 139.5 },
      cameraBounds: query,
      displayOrder: 1,
    },
  ],
})

beforeEach(() => {
  vi.mocked(request).mockReset()
})

describe('map API requests', () => {
  it.each([
    [query, query],
    [
      { ...query, keyword: '  sushi  ', mapRegionId: 7, placeType: 'cafe' },
      { ...query, keyword: 'sushi', mapRegionId: 7, placeType: 'cafe' },
    ],
    [{ ...query, keyword: ' ', placeType: 'all' }, query],
    [
      { querySessionId: 'session', sort: 'rating' },
      { querySessionId: 'session', sort: 'rating' },
    ],
    [{ cursor: 'opaque-cursor' }, { cursor: 'opaque-cursor' }],
  ])(
    'serializes only the selected request mode: %o',
    async (input, expected) => {
      vi.mocked(request).mockResolvedValue(createPage())
      const signal = new AbortController().signal
      await getMapRestaurants(input as MapPageRequest, signal)
      expect(request).toHaveBeenCalledWith('/api/v1/restaurants/map', {
        searchParams: expected,
        cache: 'no-store',
        signal,
      })
    },
  )

  it.each([
    { ...query, cursor: 'cursor' },
    { querySessionId: 'session', sort: 'rating', keyword: 'sushi' },
    { cursor: 'cursor', querySessionId: 'session' },
    { ...query, size: 10 },
    { ...query, south: Number.NaN },
    { ...query, west: 141 },
  ])(
    'rejects mixed modes or unsupported input before transport: %o',
    async (input) => {
      await expect(getMapRestaurants(input as MapPageRequest)).rejects.toThrow(
        'Invalid map request',
      )
      expect(request).not.toHaveBeenCalled()
    },
  )

  it('preserves raw API errors for page-level recovery', async () => {
    const error = new ApiError(
      {
        success: false,
        code: 'RESTAURANT-013',
        message: 'expired',
        data: null,
        timestamp: '2026-10-19T00:00:00Z',
        path: '/api/v1/restaurants/map',
      },
      410,
    )
    vi.mocked(request).mockRejectedValue(error)
    await expect(getMapRestaurants({ cursor: 'cursor' })).rejects.toBe(error)
  })
})

describe('restaurant page normalization', () => {
  it('preserves server order, cursor/session metadata and valid coordinates without fabricated fields', async () => {
    vi.mocked(request).mockResolvedValue(createPage())
    const result = await getMapRestaurants(query)
    expect(result.restaurants.map(({ id }) => id)).toEqual(['2', '1'])
    expect(result).toMatchObject({
      hasNext: true,
      nextCursor: 'opaque-next-cursor',
      query,
      querySessionId: '123e4567-e89b-12d3-a456-426614174000',
      expiresAt: '2027-01-01T00:00:00Z',
      rankingAsOf: '2026-10-19T00:00:00Z',
    })
    expect(result.restaurants[0]).toMatchObject({
      id: '2',
      name: '스시 하시',
      category: 'restaurant',
      cuisine: '스시/사시미류',
      rating: 4.2,
      reviewCount: 12,
      images: ['/legacy.jpg'],
      address: '',
      hours: '11:00 - 22:00',
      price: 'JPY 1,000 - 3,000',
      position: { lat: 35.5, lng: 139.5 },
      validUntil: location.validUntil,
      attributions: location.attributions,
    })
    expect(result.restaurants[0].saveCount).toBeUndefined()
  })

  it('uses media projections and suppresses stale legacy images for non-ready media', async () => {
    vi.mocked(request).mockResolvedValue({
      ...createPage(),
      content: [
        {
          ...card,
          cardImages: [
            {
              displayOrder: 3,
              image: { status: 'PROCESSING' },
              legacyUrl: '/stale.jpg',
            },
            { displayOrder: 2, legacyUrl: '/association.jpg' },
            {
              displayOrder: 1,
              image: { status: 'READY', defaultSource: { url: '/ready.jpg' } },
            },
          ],
        },
      ],
    })
    expect((await getMapRestaurants(query)).restaurants[0].images).toEqual([
      '/ready.jpg',
      '/association.jpg',
    ])
  })

  it('does not restore old URL fields when an explicit media array has no ready image', async () => {
    vi.mocked(request).mockResolvedValue({
      ...createPage(),
      content: [
        {
          ...card,
          cardImages: [
            { image: { status: 'FAILED' }, legacyUrl: '/stale.jpg' },
          ],
        },
      ],
    })
    expect((await getMapRestaurants(query)).restaurants[0].images).toEqual([])
  })

  it('accepts empty keyword results with null bounds and no cursor', async () => {
    vi.mocked(request).mockResolvedValue({
      ...createPage(),
      content: [],
      hasNext: false,
      nextCursor: undefined,
      query: { ...query, keyword: 'missing' },
      searchResult: { totalCount: 0, bounds: null },
    })
    expect(
      await getMapRestaurants({ ...query, keyword: 'missing' }),
    ).toMatchObject({
      restaurants: [],
      hasNext: false,
      searchResult: { totalCount: 0, bounds: null },
    })
  })

  it('allows a one-result search whose minimum and maximum bounds are equal', async () => {
    vi.mocked(request).mockResolvedValue({
      ...createPage(),
      query: { ...query, keyword: 'sushi' },
      searchResult: {
        totalCount: 1,
        bounds: { south: 35.5, north: 35.5, west: 139.5, east: 139.5 },
      },
    })
    expect((await getMapRestaurants(query)).searchResult?.totalCount).toBe(1)
  })

  it.each([
    null,
    { ...createPage(), content: undefined },
    { ...createPage(), querySessionId: undefined },
    { ...createPage(), expiresAt: 'invalid' },
    { ...createPage(), query: undefined },
    { ...createPage(), nextCursor: undefined },
    { ...createPage(), content: [{ ...card, placeType: 'unknown' }] },
    { ...createPage(), content: [{ ...card, location: undefined }] },
    {
      ...createPage(),
      content: [{ ...card, location: { ...location, latitude: 95 } }],
    },
    {
      ...createPage(),
      content: [{ ...card, location: { ...location, validUntil: 'invalid' } }],
    },
  ])(
    'rejects malformed successful payloads rather than reporting empty success: %o',
    async (payload) => {
      vi.mocked(request).mockResolvedValue(payload)
      await expect(getMapRestaurants(query)).rejects.toThrow(
        'Invalid map API response',
      )
    },
  )
})

describe('regions and selected location', () => {
  it('keeps zero-count regions and adapts server identifiers, bounds and query limits', async () => {
    vi.mocked(request).mockResolvedValue(createRegions())
    const signal = new AbortController().signal
    const result = await getMapRegions(signal)
    expect(result.regions).toEqual([
      {
        code: '7',
        name: '신주쿠',
        restaurantCount: 0,
        position: { lat: 35.5, lng: 139.5 },
        cameraBounds: { south: 35, north: 36, west: 139, east: 140 },
      },
    ])
    expect(result.queryLimits.maxLatitudeSpan).toBe(1)
    expect(request).toHaveBeenCalledWith('/api/v1/restaurants/map/regions', {
      cache: 'no-store',
      signal,
    })
  })

  it('rejects missing server configuration rather than falling back to sample bounds', async () => {
    vi.mocked(request).mockResolvedValue({
      ...createRegions(),
      queryLimits: undefined,
    })
    await expect(getMapRegions()).rejects.toThrow('Invalid map API response')
  })

  it('fetches current selected location with expiry and attribution', async () => {
    vi.mocked(request).mockResolvedValue({ restaurantId: 2, location })
    expect(await getMapRestaurantLocation('2')).toEqual({
      position: { lat: 35.5, lng: 139.5 },
      validUntil: location.validUntil,
      attributions: location.attributions,
    })
    expect(request).toHaveBeenCalledWith('/api/v1/restaurants/2/map-location', {
      cache: 'no-store',
      signal: undefined,
    })
  })

  it('rejects a location response for a different selected restaurant', async () => {
    vi.mocked(request).mockResolvedValue({ restaurantId: 3, location })
    await expect(getMapRestaurantLocation('2')).rejects.toThrow(
      'Invalid map API response',
    )
  })
})
