import { act, renderHook, waitFor, cleanup } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useMapPageState } from '@/pages/map/hooks/useMapPageState'
import { MAP_PREVIEW_RESTAURANTS } from '@/pages/map/data/mapPreviewRestaurants'

afterEach(cleanup)
it('restores loaded results and selection without refetching', async () => {
  const source = vi.fn()
  const initial = {
    conditions: {
      keyword: '',
      category: 'all' as const,
      sort: 'rating' as const,
      areaCode: null,
    },
    searchBounds: null,
    camera: null,
    restaurants: MAP_PREVIEW_RESTAURANTS,
    selectedId: MAP_PREVIEW_RESTAURANTS[0].id,
    stage: 'normal' as const,
    detailStage: 'collapsed' as const,
    isExploring: true,
  }
  const { result } = renderHook(() => useMapPageState(source, initial))
  expect(result.current.restaurants).toHaveLength(7)
  expect(result.current.selectedRestaurant?.id).toBe(initial.selectedId)
  await act(async () => {})
  expect(source).not.toHaveBeenCalled()
})
const emptyBounds = { south: 0, north: 1, west: 0, east: 1 }
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
  const source = vi
    .fn()
    .mockResolvedValue({ restaurants: MAP_PREVIEW_RESTAURANTS })
  const { result } = renderHook(() => useMapPageState(source))
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
      center: { lat: 0.5, lng: 0.5 },
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
    expect.objectContaining({
      conditions: {
        keyword: '',
        category: 'all',
        areaCode: null,
        sort: 'reviews',
      },
      bounds: emptyBounds,
    }),
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
  act(() => result.current.handleSearchArea(emptyBounds))
  await waitFor(() => expect(result.current.emptyKind).toBe('region'))
  act(() => result.current.handleConditionsChange({ keyword: 'no match' }))
  await waitFor(() => expect(result.current.status).toBe('success'))
  expect(result.current.emptyKind).toBe('conditions')
})
it('ignores late results after reset, including empty-result events', async () => {
  let resolve!: (value: { restaurants: typeof MAP_PREVIEW_RESTAURANTS }) => void
  const source = vi
    .fn()
    .mockResolvedValue({ restaurants: MAP_PREVIEW_RESTAURANTS })
  const { result } = renderHook(() => useMapPageState(source))
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
  await act(async () => resolve({ restaurants: [] }))
  expect(result.current.restaurants).toHaveLength(7)
  expect(result.current.emptyEvent).toBeNull()
})
it('retries identical requests and prevents duplicate next-page requests', async () => {
  const source = vi.fn().mockResolvedValue({
    restaurants: MAP_PREVIEW_RESTAURANTS,
    nextCursor: 'next',
  })
  const { result } = renderHook(() => useMapPageState(source))
  await waitFor(() => expect(result.current.status).toBe('success'))
  source.mockRejectedValueOnce(new Error('network'))
  act(() => {
    result.current.loadNext()
    result.current.loadNext()
  })
  await waitFor(() => expect(result.current.nextError).toBe(true))
  expect(source).toHaveBeenCalledTimes(2)
  expect(result.current.restaurants).toHaveLength(7)
  source.mockResolvedValueOnce({ restaurants: MAP_PREVIEW_RESTAURANTS })
  act(() => result.current.loadNext())
  await waitFor(() => expect(result.current.nextError).toBe(false))
  expect(result.current.restaurants).toHaveLength(7)
  expect(source.mock.calls[1][0]).toEqual(source.mock.calls[2][0])
})
