import {
  act,
  renderHook as renderRealHook,
  waitFor,
  cleanup,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type PropsWithChildren } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useMapPageState } from '@/pages/map/hooks/useMapPageState'
import { getMapRegions } from '@/pages/map/api/getMapRegions'
import { getMapRestaurants } from '@/pages/map/api/getMapRestaurants'
import { getMapRestaurantLocation } from '@/pages/map/api/getMapRestaurantLocation'
import type { MapRestaurantPage } from '@/pages/map/api/mapApiTypes'
import type { MapSessionSnapshot } from '@/pages/map/types'
import {
  createMapPageFixture,
  createMapLocationFixture,
  mapFixtureRestaurants,
  mapRegionsFixture,
} from '@/pages/map/__tests__/mapApiFixtures'

vi.mock('@/pages/map/api/getMapRegions', () => ({ getMapRegions: vi.fn() }))
vi.mock('@/pages/map/api/getMapRestaurants', () => ({
  getMapRestaurants: vi.fn(),
}))
vi.mock('@/pages/map/api/getMapRestaurantLocation', () => ({
  getMapRestaurantLocation: vi.fn(),
}))
const clients: QueryClient[] = []
const renderHook = (callback: () => ReturnType<typeof useMapPageState>) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  clients.push(client)
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { client }, children)
  return renderRealHook(callback, { wrapper })
}
beforeEach(() => {
  vi.mocked(getMapRegions).mockReset().mockResolvedValue(mapRegionsFixture)
  vi.mocked(getMapRestaurants)
    .mockReset()
    .mockImplementation(async (request) => createMapPageFixture(request))
  vi.mocked(getMapRestaurantLocation)
    .mockReset()
    .mockImplementation(async (id) => createMapLocationFixture(id))
})

afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
})
it('restores loaded results and selection without refetching', async () => {
  const source = vi.mocked(getMapRestaurants)
  const page = createMapPageFixture()
  const initial: MapSessionSnapshot = {
    conditions: {
      keyword: '',
      category: 'all' as const,
      sort: 'rating' as const,
      areaCode: null,
    },
    searchBounds: null,
    camera: null,
    queryData: { pages: [page], pageParams: [page.query] },
    restaurants: mapFixtureRestaurants,
    selectedId: mapFixtureRestaurants[0].id,
    stage: 'normal' as const,
    detailStage: 'collapsed' as const,
    isExploring: true,
  }
  const { result } = renderHook(() => useMapPageState(initial))
  expect(result.current.restaurants).toHaveLength(7)
  expect(result.current.selectedRestaurant?.id).toBe(initial.selectedId)
  await act(async () => {})
  expect(source).not.toHaveBeenCalled()
})
const emptyBounds = { south: 35.8, north: 35.81, west: 139.8, east: 139.81 }
it.each(['all', 'cafe'] as const)(
  'restores camera display mode after detail for %s',
  async (category) => {
    const { result } = renderHook(() => useMapPageState())
    await waitFor(() => expect(result.current.status).toBe('success'))
    act(() => result.current.handleConditionsChange({ category }))
    await waitFor(() => expect(result.current.status).toBe('success'))
    act(() =>
      result.current.handleSelectRestaurant(result.current.restaurants[0].id),
    )
    act(() =>
      result.current.restoreCamera(
        {
          center: { lat: 35.7, lng: 139.7 },
          zoom: 12,
          minZoom: 12,
          bounds: emptyBounds,
        },
        category !== 'all',
      ),
    )
    expect(result.current.isExploring).toBe(category !== 'all')
  },
)
it('restores regions on clearing conditions at overview zoom', async () => {
  const { result } = renderHook(() => useMapPageState())
  await waitFor(() => expect(result.current.status).toBe('success'))
  act(() => result.current.handleConditionsChange({ category: 'cafe' }))
  act(() => result.current.handleConditionsChange({ category: 'all' }))
  expect(result.current.isExploring).toBe(false)
})
it('clears the category and re-queries the current bounds on overview restoration', async () => {
  const source = vi.mocked(getMapRestaurants)
  const { result } = renderHook(() => useMapPageState())
  await waitFor(() => expect(result.current.status).toBe('success'))
  act(() =>
    result.current.handleConditionsChange({
      category: 'cafe',
      sort: 'reviews',
    }),
  )
  await waitFor(() => expect(result.current.status).toBe('success'))
  act(() =>
    result.current.handleCameraChange({
      center: { lat: 35.805, lng: 139.805 },
      zoom: 10.5,
      minZoom: 10.5,
      bounds: emptyBounds,
    }),
  )
  act(() => result.current.handleOverview())
  expect(result.current.conditions.category).toBe('all')
  expect(result.current.isExploring).toBe(false)
  expect(result.current.status).toBe('loading')
  expect(result.current.restaurants).toEqual([])
  await waitFor(() => expect(result.current.status).toBe('success'))
  expect(source).toHaveBeenLastCalledWith(
    { ...emptyBounds, sort: 'reviews' },
    expect.any(AbortSignal),
  )
  const calls = source.mock.calls.length
  act(() => result.current.handleOverview())
  expect(source).toHaveBeenCalledTimes(calls)
})
it('does not clear keyword or category when overview is requested during search', async () => {
  const { result } = renderHook(() => useMapPageState())
  await waitFor(() => expect(result.current.status).toBe('success'))
  act(() =>
    result.current.handleConditionsChange({
      keyword: 'coffee',
      category: 'cafe',
    }),
  )
  act(() => result.current.handleOverview())
  expect(result.current.isExploring).toBe(true)
  expect(result.current.conditions.category).toBe('cafe')
})
it('distinguishes viewport and condition empty results', async () => {
  const { result } = renderHook(() => useMapPageState())
  await waitFor(() => expect(result.current.status).toBe('success'))
  vi.mocked(getMapRestaurants).mockResolvedValueOnce({
    ...createMapPageFixture(),
    restaurants: [],
  })
  act(() => result.current.handleSearchArea(emptyBounds))
  await waitFor(() => expect(result.current.emptyKind).toBe('region'))
  act(() => result.current.handleConditionsChange({ keyword: 'no match' }))
  await waitFor(() => expect(result.current.status).toBe('success'))
  expect(result.current.emptyKind).toBe('conditions')
})
it('ignores late results after reset, including empty-result events', async () => {
  let resolve!: (value: MapRestaurantPage) => void
  const source = vi.mocked(getMapRestaurants)
  const { result } = renderHook(() => useMapPageState())
  await waitFor(() => expect(result.current.status).toBe('success'))
  source.mockImplementationOnce(
    () =>
      new Promise((r) => {
        resolve = r
      }),
  )
  act(() => result.current.handleSearchArea(emptyBounds))
  act(() => result.current.handleReset())
  await waitFor(() => expect(result.current.status).toBe('success'))
  await act(async () => resolve({ ...createMapPageFixture(), restaurants: [] }))
  expect(result.current.restaurants).toHaveLength(7)
  expect(result.current.emptyEvent).toBeNull()
})
it('retries identical requests and prevents duplicate next-page requests', async () => {
  const source = vi.mocked(getMapRestaurants).mockResolvedValue({
    ...createMapPageFixture(),
    hasNext: true,
    nextCursor: 'next',
  })
  const { result } = renderHook(() => useMapPageState())
  await waitFor(() => expect(result.current.status).toBe('success'))
  source.mockRejectedValueOnce(new Error('network'))
  act(() => {
    result.current.loadNext()
    result.current.loadNext()
  })
  await waitFor(() => expect(result.current.nextError).toBe(true))
  expect(source).toHaveBeenCalledTimes(2)
  expect(result.current.restaurants).toHaveLength(7)
  source.mockResolvedValueOnce(createMapPageFixture())
  act(() => result.current.loadNext())
  await waitFor(() => expect(result.current.nextError).toBe(false))
  expect(result.current.restaurants).toHaveLength(7)
  expect(source.mock.calls[1][0]).toEqual(source.mock.calls[2][0])
})
