import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useMapPageState } from '@/pages/map/hooks/useMapPageState'
import { request } from '@/shared/api/request'
import { ApiError } from '@/shared/api/apiError'
import type { MapSessionSnapshot } from '@/pages/map/types'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))
const mockedRequest = vi.mocked(request)
const bounds = { south: 35.6, north: 35.8, west: 139.6, east: 139.9 }
const camera = {
  center: { lat: 35.7, lng: 139.75 },
  zoom: 13,
  minZoom: 12,
  bounds,
}
const card = {
  restaurantId: 101,
  name: '서버 식당',
  placeType: 'restaurant',
  rating: 4.5,
  reviewCount: 12,
  area: '신주쿠',
  genre: 'grill',
  foodCategory: '구이',
  summary: '실제 식당 설명',
  imageUrls: [],
  hashtags: [],
  location: {
    latitude: 35.7,
    longitude: 139.7,
    validUntil: '2099-01-01T00:00:00Z',
    attributions: [] as { displayName: string; uri: string }[],
  },
}
const page = (content = [card], extra: Record<string, unknown> = {}) => ({
  content,
  hasNext: false,
  querySessionId: '123e4567-e89b-12d3-a456-426614174000',
  expiresAt: '2099-01-01T00:00:00Z',
  rankingAsOf: '2026-10-19T00:00:00Z',
  query: { ...bounds, sort: 'recommend' },
  ...extra,
})
const apiError = (status: number, code: string) =>
  new ApiError(
    {
      success: false,
      code,
      message: '실패',
      data: null,
      timestamp: '',
      path: '',
    },
    status,
  )
let pages: ReturnType<typeof vi.fn>
const clients: QueryClient[] = []
const renderState = (initial: MapSessionSnapshot | null = null) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  clients.push(client)
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return renderHook(() => useMapPageState(initial), { wrapper })
}
beforeEach(() => {
  pages = vi.fn().mockResolvedValue(page())
  mockedRequest.mockImplementation(async (path, options) => {
    if (path === '/api/v1/restaurants/map/regions')
      return {
        initialBounds: bounds,
        queryLimits: {
          supportedBounds: { south: 35, north: 36, west: 139, east: 140 },
          maxLatitudeSpan: 1,
          maxLongitudeSpan: 1,
        },
        regions: [
          {
            mapRegionId: 7,
            name: '서버 지역',
            restaurantCount: 10,
            clusterPosition: { latitude: 35.7, longitude: 139.7 },
            cameraBounds: bounds,
            displayOrder: 1,
          },
        ],
      }
    if (path === '/api/v1/restaurants/map') return pages(options?.searchParams)
    if (path === '/api/v1/restaurants/101/map-location')
      return { restaurantId: 101, location: card.location }
    throw new Error(`Unexpected endpoint ${path}`)
  })
})
afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
  vi.restoreAllMocks()
  vi.useRealTimers()
})

it('uses server regions and first-page data without a preview fallback', async () => {
  const { result } = renderState()
  await waitFor(() => expect(result.current.status).toBe('success'))
  expect(result.current.restaurants.map((item) => item.name)).toEqual([
    '서버 식당',
  ])
  expect(result.current.areas[0]).toMatchObject({
    code: '7',
    restaurantCount: 10,
  })
  expect(pages).toHaveBeenCalledWith({ ...bounds, sort: 'recommend' })
})

it('sends session+sort only for sorting, and cursor only for the next page', async () => {
  const { result } = renderState()
  await waitFor(() => expect(result.current.status).toBe('success'))
  pages.mockResolvedValueOnce(
    page([card], {
      hasNext: true,
      nextCursor: 'x'.repeat(72),
      query: { ...bounds, sort: 'rating' },
    }),
  )
  act(() => result.current.handleConditionsChange({ sort: 'rating' }))
  await waitFor(() => expect(result.current.nextCursor).toBe('x'.repeat(72)))
  expect(pages).toHaveBeenLastCalledWith({
    querySessionId: '123e4567-e89b-12d3-a456-426614174000',
    sort: 'rating',
  })
  act(() => {
    result.current.loadNext()
    result.current.loadNext()
  })
  await waitFor(() => expect(result.current.nextCursor).toBeUndefined())
  expect(pages).toHaveBeenLastCalledWith({ cursor: 'x'.repeat(72) })
  expect(pages).toHaveBeenCalledTimes(3)
  expect(result.current.restaurants).toHaveLength(1)
})

it('recovers an expired cursor from the last successful server query', async () => {
  pages.mockResolvedValueOnce(
    page([card], { hasNext: true, nextCursor: 'x'.repeat(72) }),
  )
  const { result } = renderState()
  await waitFor(() => expect(result.current.nextCursor).toBeDefined())
  pages.mockRejectedValueOnce(apiError(410, 'RESTAURANT-013'))
  act(() => result.current.loadNext())
  await waitFor(() => expect(pages).toHaveBeenCalledTimes(3))
  expect(pages).toHaveBeenLastCalledWith({ ...bounds, sort: 'recommend' })
  await waitFor(() => expect(result.current.status).toBe('success'))
})

it('recovers again when a successfully recovered session later expires', async () => {
  pages.mockResolvedValueOnce(
    page([card], { hasNext: true, nextCursor: 'x'.repeat(72) }),
  )
  const { result } = renderState()
  await waitFor(() => expect(result.current.nextCursor).toBe('x'.repeat(72)))
  pages
    .mockRejectedValueOnce(apiError(410, 'RESTAURANT-013'))
    .mockResolvedValueOnce(
      page([card], {
        querySessionId: '123e4567-e89b-12d3-a456-426614174001',
        hasNext: true,
        nextCursor: 'y'.repeat(72),
      }),
    )
  act(() => result.current.loadNext())
  await waitFor(() => expect(result.current.nextCursor).toBe('y'.repeat(72)))
  pages
    .mockRejectedValueOnce(apiError(410, 'RESTAURANT-013'))
    .mockResolvedValueOnce(
      page([{ ...card, name: '두 번째 복구 식당' }], {
        querySessionId: '123e4567-e89b-12d3-a456-426614174002',
      }),
    )
  act(() => result.current.loadNext())
  await waitFor(() =>
    expect(result.current.restaurants[0]?.name).toBe('두 번째 복구 식당'),
  )
  expect(pages).toHaveBeenCalledTimes(5)
  expect(pages).toHaveBeenLastCalledWith({ ...bounds, sort: 'recommend' })
})

it('stops automatic recovery when the recovery request itself also returns 410', async () => {
  pages.mockResolvedValueOnce(
    page([card], { hasNext: true, nextCursor: 'x'.repeat(72) }),
  )
  const { result } = renderState()
  await waitFor(() => expect(result.current.nextCursor).toBeDefined())
  pages.mockRejectedValue(apiError(410, 'RESTAURANT-013'))
  act(() => result.current.loadNext())
  await waitFor(() => expect(result.current.status).toBe('error'))
  expect(pages).toHaveBeenCalledTimes(3)
})

it('keeps successful results on configuration failure and retries the failed viewport', async () => {
  const { result } = renderState()
  await waitFor(() => expect(result.current.status).toBe('success'))
  const moved = { ...bounds, north: 35.85 }
  act(() => result.current.handleCameraChange(camera))
  pages.mockRejectedValueOnce(apiError(503, 'RESTAURANT-017'))
  act(() => result.current.handleSearchArea(moved))
  await waitFor(() => expect(result.current.nextError).toBe(true))
  expect(result.current.restaurants[0]?.name).toBe('서버 식당')
  act(() => result.current.retry())
  await waitFor(() => expect(result.current.nextError).toBe(false))
  expect(pages).toHaveBeenLastCalledWith({ ...moved, sort: 'recommend' })
})

it('uses all-result bounds for search rather than fitting only the first page', async () => {
  const { result } = renderState()
  await waitFor(() => expect(result.current.status).toBe('success'))
  pages.mockResolvedValueOnce(
    page([card], {
      searchResult: { totalCount: 20, bounds },
      query: { ...bounds, sort: 'recommend', keyword: '스시' },
    }),
  )
  act(() => result.current.handleConditionsChange({ keyword: '스시' }))
  await waitFor(() =>
    expect(result.current.searchPositions).toEqual([
      { lat: 35.6, lng: 139.6 },
      { lat: 35.8, lng: 139.9 },
    ]),
  )
})

it('does not reuse an old session when sorting a failed new filter', async () => {
  const { result } = renderState()
  await waitFor(() => expect(result.current.status).toBe('success'))
  pages.mockRejectedValueOnce(apiError(503, 'RESTAURANT-017'))
  act(() => result.current.handleConditionsChange({ category: 'cafe' }))
  await waitFor(() => expect(result.current.nextError).toBe(true))
  act(() => result.current.handleConditionsChange({ sort: 'rating' }))
  await waitFor(() => expect(pages).toHaveBeenCalledTimes(3))
  expect(pages).toHaveBeenLastCalledWith({
    ...bounds,
    sort: 'rating',
    placeType: 'cafe',
  })
})

it('restores successful query conditions when an attempted session sort expires', async () => {
  const { result } = renderState()
  await waitFor(() => expect(result.current.status).toBe('success'))
  pages.mockRejectedValueOnce(apiError(410, 'RESTAURANT-013'))
  act(() => result.current.handleConditionsChange({ sort: 'rating' }))
  await waitFor(() => expect(pages).toHaveBeenCalledTimes(3))
  expect(pages).toHaveBeenLastCalledWith({ ...bounds, sort: 'recommend' })
  expect(result.current.conditions.sort).toBe('recommended')
})

it('can clear recovered filters without leaking them back through the stored bounds', async () => {
  const { result } = renderState()
  await waitFor(() => expect(result.current.status).toBe('success'))
  const cafeQuery = { ...bounds, placeType: 'cafe', sort: 'recommend' }
  pages.mockResolvedValueOnce(
    page([card], {
      query: cafeQuery,
      hasNext: true,
      nextCursor: 'x'.repeat(72),
    }),
  )
  act(() => result.current.handleConditionsChange({ category: 'cafe' }))
  await waitFor(() => expect(result.current.nextCursor).toBeDefined())
  pages
    .mockRejectedValueOnce(apiError(410, 'RESTAURANT-013'))
    .mockResolvedValueOnce(page([card], { query: cafeQuery }))
  act(() => result.current.loadNext())
  await waitFor(() => expect(pages).toHaveBeenCalledTimes(4))
  await waitFor(() => expect(result.current.status).toBe('success'))
  act(() => result.current.handleConditionsChange({ category: 'all' }))
  await waitFor(() => expect(pages).toHaveBeenCalledTimes(5))
  expect(pages).toHaveBeenLastCalledWith({ ...bounds, sort: 'recommend' })
})

it('queries the current viewport when sorting after panning without a search', async () => {
  const { result } = renderState()
  await waitFor(() => expect(result.current.status).toBe('success'))
  act(() => result.current.handleSearchArea(bounds))
  await waitFor(() => expect(pages).toHaveBeenCalledTimes(2))
  await waitFor(() => expect(result.current.status).toBe('success'))
  act(() =>
    result.current.handleCameraChange({
      ...camera,
      bounds: { ...bounds, north: 35.9 },
    }),
  )
  act(() => result.current.handleConditionsChange({ sort: 'rating' }))
  await waitFor(() => expect(pages).toHaveBeenCalledTimes(3))
  expect(result.current.searchBounds).toEqual({ ...bounds, north: 35.9 })
  expect(pages).toHaveBeenLastCalledWith({
    ...bounds,
    north: 35.9,
    sort: 'rating',
  })
})

it('reports a restored selection missing from the refreshed session only after the first page settles', async () => {
  const first = renderState()
  await waitFor(() => expect(first.result.current.status).toBe('success'))
  const queryData = first.result.current.queryData!
  const initial: MapSessionSnapshot = {
    conditions: first.result.current.conditions,
    camera,
    searchBounds: bounds,
    queryData: {
      ...queryData,
      pages: queryData.pages.map((value) => ({
        ...value,
        expiresAt: '2000-01-01T00:00:00Z',
      })),
    },
    selectedId: '101',
    isExploring: true,
    stage: 'normal',
    detailStage: 'expanded',
  }
  first.unmount()
  let resolvePage!: (value: ReturnType<typeof page>) => void
  pages.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolvePage = resolve
      }),
  )
  const { result } = renderState(initial)
  await waitFor(() => expect(pages).toHaveBeenCalledTimes(2))
  expect(result.current.selectionFailed).toBe(false)
  await act(async () => resolvePage(page([{ ...card, restaurantId: 202 }])))
  await waitFor(() => expect(result.current.selectionFailed).toBe(true))
  act(() => result.current.setSelectedId(null))
  act(() => result.current.handleOverview())
  expect(result.current.isExploring).toBe(false)
})

it('removes expired coordinates and attribution after returning from the background', async () => {
  const expires = Date.now() + 60_000
  pages.mockResolvedValueOnce(
    page([
      {
        ...card,
        location: {
          ...card.location,
          validUntil: new Date(expires).toISOString(),
          attributions: [{ displayName: '제공자', uri: 'https://example.com' }],
        },
      },
    ]),
  )
  const { result } = renderState()
  await waitFor(() => expect(result.current.restaurants).toHaveLength(1))
  vi.spyOn(Date, 'now').mockReturnValue(expires)
  act(() => window.dispatchEvent(new Event('pageshow')))
  expect(result.current.restaurants).toEqual([])
})

it('blocks requests outside configured bounds and with invalid keywords', async () => {
  const { result } = renderState()
  await waitFor(() => expect(result.current.status).toBe('success'))
  act(() => result.current.handleSearchArea({ ...bounds, north: 40 }))
  expect(result.current.status).toBe('error')
  expect(result.current.errorMessage).toContain('지원하지')
  act(() => result.current.handleReset())
  await waitFor(() => expect(result.current.status).toBe('success'))
  const count = pages.mock.calls.length
  act(() => result.current.handleConditionsChange({ keyword: '#두 개' }))
  expect(result.current.errorMessage).toContain('공백 없이')
  expect(pages).toHaveBeenCalledTimes(count)
})

it('disables retries for 60 seconds after rate limiting', async () => {
  pages.mockRejectedValueOnce(apiError(429, 'RATE_LIMIT'))
  const { result } = renderState()
  await waitFor(() => expect(result.current.retryDisabled).toBe(true))
  act(() => result.current.retry())
  expect(pages).toHaveBeenCalledTimes(1)
  vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 60_001)
  act(() => window.dispatchEvent(new Event('pageshow')))
  expect(result.current.retryDisabled).toBe(false)
  act(() => result.current.retry())
  await waitFor(() => expect(result.current.status).toBe('success'))
})

it('marks a disappeared selected restaurant as a detail failure', async () => {
  const implementation = mockedRequest.getMockImplementation()!
  mockedRequest.mockImplementation((path, options) =>
    path === '/api/v1/restaurants/101/map-location'
      ? Promise.reject(apiError(404, 'RESTAURANT-001'))
      : implementation(path, options),
  )
  const { result } = renderState()
  await waitFor(() => expect(result.current.status).toBe('success'))
  act(() => result.current.handleSelectRestaurant('101'))
  await waitFor(() => expect(result.current.selectionFailed).toBe(true))
})
