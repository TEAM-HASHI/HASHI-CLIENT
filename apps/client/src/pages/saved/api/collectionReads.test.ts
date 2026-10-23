import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCollection } from '@/pages/saved/api/getCollection'
import { getCollections } from '@/pages/saved/api/getCollections'
import { getSavedRestaurants } from '@/pages/saved/api/getSavedRestaurants'
import { getCollectionMapMarkers } from '@/pages/saved/api/getCollectionMapMarkers'

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }))
vi.mock('@/shared/api/request', () => ({ request: mockRequest }))

describe('collection read API contracts', () => {
  it('전체 지도 핀을 페이지·필터 없이 요청하고 좌표와 출처를 보존한다', async () => {
    mockRequest.mockResolvedValue({
      collectionId: 8,
      content: [
        {
          restaurantId: 55,
          name: '카페',
          placeType: 'cafe',
          location: {
            latitude: 35,
            longitude: 139,
            validUntil: '2030-01-01T00:00:00Z',
            attributions: [{ displayName: '출처', uri: 'https://example.com' }],
          },
        },
      ],
    })
    const signal = new AbortController().signal
    expect(await getCollectionMapMarkers(8, signal)).toEqual([
      {
        id: '55',
        name: '카페',
        category: 'cafe',
        position: { lat: 35, lng: 139 },
        validUntil: '2030-01-01T00:00:00Z',
        attributions: [{ displayName: '출처', uri: 'https://example.com' }],
      },
    ])
    expect(mockRequest).toHaveBeenCalledWith(
      '/api/v1/collections/8/map-markers',
      { signal, cache: 'no-store' },
    )
    mockRequest.mockResolvedValue({ collectionId: 9, content: [] })
    await expect(getCollectionMapMarkers(8)).rejects.toThrow()
  })
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('requests a numeric collection cursor and keeps the server total count', async () => {
    const page = {
      collections: [{ collectionId: 8 }],
      totalCount: 42,
      hasNext: true,
      nextCursor: 8,
    }
    mockRequest.mockResolvedValue(page)
    const signal = new AbortController().signal
    await expect(
      getCollections({ restaurantId: 5, cursor: 12, size: 10 }, signal),
    ).resolves.toEqual(page)
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/collections', {
      method: 'get',
      searchParams: { restaurantId: 5, cursor: 12, size: 10 },
      signal,
    })
  })

  it('accepts an empty final collection page without inventing data', async () => {
    const page = {
      collections: [],
      totalCount: 0,
      hasNext: false,
      nextCursor: null,
    }
    mockRequest.mockResolvedValue(page)
    await expect(getCollections()).resolves.toEqual(page)
  })

  it('requests a detail without converting a missing payload to an empty object', async () => {
    const detail = { collectionId: 8, description: 'trip', owner: true }
    mockRequest.mockResolvedValue(detail)
    await expect(getCollection(8)).resolves.toEqual(detail)
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/collections/8', {
      method: 'get',
      signal: undefined,
    })
  })

  it('preserves string restaurant cursors and server-side filters', async () => {
    const page = {
      content: [{ restaurantId: 5 }],
      hasNext: true,
      nextCursor: 'opaque-next',
    }
    mockRequest.mockResolvedValue(page)
    const params = {
      cursor: 'opaque-current',
      sort: 'review',
      placeType: 'cafe',
      size: 10,
    }
    await expect(getSavedRestaurants(8, params)).resolves.toEqual(page)
    expect(mockRequest).toHaveBeenCalledWith(
      '/api/v1/collections/8/restaurants',
      {
        method: 'get',
        searchParams: params,
        signal: undefined,
      },
    )
  })

  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects an invalid ID %s before requesting',
    async (id) => {
      await expect(getCollection(id)).rejects.toThrow('collectionId')
      await expect(getSavedRestaurants(id)).rejects.toThrow('collectionId')
      expect(mockRequest).not.toHaveBeenCalled()
    },
  )

  it('rejects null payloads instead of presenting a successful empty result', async () => {
    mockRequest.mockResolvedValue(null)
    await expect(getCollections()).rejects.toThrow('response')
    await expect(getCollection(8)).rejects.toThrow('response')
    await expect(getSavedRestaurants(8)).rejects.toThrow('response')
  })

  it.each([
    { collections: [], totalCount: 0 },
    { collections: [], totalCount: 0, hasNext: true },
    { collections: [], totalCount: 0, hasNext: true, nextCursor: '8' },
    { totalCount: 0, hasNext: false },
    { collections: [], hasNext: false },
  ])('rejects incomplete collection pagination %#', async (page) => {
    mockRequest.mockResolvedValue(page)
    await expect(getCollections()).rejects.toThrow('response')
  })

  it.each([
    { content: [], hasNext: true },
    { content: [], hasNext: true, nextCursor: 8 },
    { content: [], hasNext: true, nextCursor: '' },
    { hasNext: false },
  ])('rejects incomplete restaurant pagination %#', async (page) => {
    mockRequest.mockResolvedValue(page)
    await expect(getSavedRestaurants(8)).rejects.toThrow('response')
  })

  it('rejects cursors that repeat the requested page', async () => {
    mockRequest.mockResolvedValue({
      collections: [],
      totalCount: 0,
      hasNext: true,
      nextCursor: 8,
    })
    await expect(getCollections({ cursor: 8 })).rejects.toThrow('response')
    mockRequest.mockResolvedValue({
      content: [],
      hasNext: true,
      nextCursor: 'same',
    })
    await expect(getSavedRestaurants(8, { cursor: 'same' })).rejects.toThrow(
      'response',
    )
  })

  it('preserves the original API error object and code', async () => {
    const error = Object.assign(new Error('not found'), {
      status: 404,
      code: 'USER-006',
    })
    mockRequest.mockRejectedValue(error)
    await expect(getCollection(8)).rejects.toBe(error)
    await expect(getCollections()).rejects.toBe(error)
    await expect(getSavedRestaurants(8)).rejects.toBe(error)
  })
})
