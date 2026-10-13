import { act, renderHook, waitFor, cleanup } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useMapPageState } from '@/pages/map/hooks/useMapPageState'
import { MAP_PREVIEW_RESTAURANTS } from '@/pages/map/data/mapPreviewRestaurants'

afterEach(cleanup)
const emptyBounds = { south: 0, north: 1, west: 0, east: 1 }
it('restores regions on clearing conditions at overview zoom', async () => {
  const { result } = renderHook(() => useMapPageState())
  await waitFor(() => expect(result.current.status).toBe('success'))
  act(() => result.current.handleConditionsChange({ category: 'cafe' }))
  act(() => result.current.handleConditionsChange({ category: 'all' }))
  expect(result.current.isExploring).toBe(false)
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
