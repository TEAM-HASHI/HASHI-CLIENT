import { NetworkError } from 'ky'
import { describe, expect, it, vi } from 'vitest'

import { mapQueryKeys } from '@/pages/map/queries/mapQueryKeys'
import {
  checkShouldRetryMapQuery,
  mapRegionsQueryOptions,
  mapRestaurantLocationQueryOptions,
  mapRestaurantsQueryOptions,
} from '@/pages/map/queries/mapQueryOptions'
import { ApiError, HttpStatusError } from '@/shared/api/apiError'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))

const error = (status: number, code: string) =>
  new ApiError(
    {
      success: false,
      code,
      message: 'map error',
      data: null,
      timestamp: '2026-10-19T00:00:00Z',
      path: '/api/v1/restaurants/map',
    },
    status,
  )

describe('map query policy', () => {
  it.each([
    [new HttpStatusError(503), true],
    [new NetworkError(new Request('https://api.example')), true],
    [error(503, 'RESTAURANT-015'), true],
    [error(503, 'RESTAURANT-016'), true],
    [error(503, 'RESTAURANT-017'), false],
    [error(503, 'RESTAURANT-014'), false],
    [error(410, 'RESTAURANT-013'), false],
    [error(429, 'RESTAURANT-022'), false],
    [new Error('malformed payload'), false],
  ])(
    'automatically retries only transient transport failures once: %o',
    (error, expected) => {
      expect(checkShouldRetryMapQuery(0, error)).toBe(expected)
      expect(checkShouldRetryMapQuery(1, error)).toBe(false)
    },
  )

  it('keeps failures local and avoids retaining expired coordinates or focus re-fetching', () => {
    const options = [
      mapRegionsQueryOptions(),
      mapRestaurantsQueryOptions({ cursor: 'next' }),
      mapRestaurantLocationQueryOptions('1'),
    ]
    options.forEach((option) => {
      expect(option).toMatchObject({
        throwOnError: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
      })
    })
  })

  it('separates finite and infinite requests and re-query generations', () => {
    const first = mapQueryKeys.infiniteList(
      { querySessionId: 'session', sort: 'rating' },
      1,
    )
    expect(first).not.toEqual(
      mapQueryKeys.list({ querySessionId: 'session', sort: 'rating' }),
    )
    expect(first).not.toEqual(
      mapQueryKeys.infiniteList(
        { querySessionId: 'session', sort: 'rating' },
        2,
      ),
    )
    expect(first).not.toEqual(
      mapQueryKeys.infiniteList(
        { querySessionId: 'session', sort: 'reviews' },
        1,
      ),
    )
  })
})
