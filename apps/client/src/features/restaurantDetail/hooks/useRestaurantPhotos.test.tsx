import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useRestaurantPhotos } from '@/features/restaurantDetail/hooks/useRestaurantPhotos'

const { getPage } = vi.hoisted(() => ({ getPage: vi.fn() }))
vi.mock('@/features/restaurantDetail/api/restaurantPhotoSource', () => ({
  getRestaurantPhotoDataSource: () => ({ key: 'test', source: { getPage } }),
}))

const counts = { all: 21, representative: 1, review: 20, menu: 0 }
const photo = (id: string) => ({
  id,
  thumbnailUrl: '/small.png',
  imageUrl: '/large.png',
  width: 800,
  height: 600,
})
let client: QueryClient
const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
)

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  getPage.mockReset()
  getPage.mockImplementation(async ({ filter, cursor }) => ({
    photos:
      filter === 'menu'
        ? []
        : cursor
          ? [photo('last')]
          : Array.from({ length: 20 }, (_, i) => photo(String(i))),
    counts,
    nextCursor: filter === 'menu' || cursor ? undefined : 'next',
  }))
})
afterEach(() => {
  cleanup()
  client.clear()
  vi.unstubAllEnvs()
})

describe('useRestaurantPhotos', () => {
  it('retains counts on filter failure but does not carry them to another restaurant', async () => {
    const { result, rerender } = renderHook(
      ({ id }) => useRestaurantPhotos(id, true),
      { initialProps: { id: 10 }, wrapper },
    )
    await waitFor(() => expect(result.current.counts).toEqual(counts))
    getPage.mockRejectedValue(new Error('filter unavailable'))
    act(() => result.current.selectFilter('review'))
    expect(result.current.counts).toEqual(counts)
    await waitFor(() => expect(result.current.query.isError).toBe(true))
    expect(result.current.counts).toEqual(counts)
    rerender({ id: 20 })
    expect(result.current.counts).toBeUndefined()
    await waitFor(() => expect(result.current.query.isError).toBe(true))
    expect(result.current.counts).toBeUndefined()
  })

  it('does not refetch loaded pages while the photo tab is inactive', async () => {
    const { result, rerender } = renderHook(
      ({ active }) => useRestaurantPhotos(10, active),
      { initialProps: { active: true }, wrapper },
    )
    await waitFor(() => expect(result.current.photos).toHaveLength(20))
    await act(async () => {
      await result.current.query.fetchNextPage()
    })
    await waitFor(() => expect(result.current.photos).toHaveLength(21))
    rerender({ active: false })
    getPage.mockClear()
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['restaurantPhotos', 10] })
    })
    expect(getPage).not.toHaveBeenCalled()
    expect(result.current.counts).toEqual(counts)
  })

  it('reuses the first page fetched for counts when the photo tab opens', async () => {
    const { result, rerender } = renderHook(
      ({ active }) => useRestaurantPhotos(10, active),
      { initialProps: { active: false }, wrapper },
    )
    await waitFor(() => expect(result.current.counts?.all).toBe(21))
    rerender({ active: true })
    await waitFor(() => expect(result.current.photos).toHaveLength(20))
    expect(getPage).toHaveBeenCalledTimes(1)
  })

  it('restarts with one page instead of replaying loaded cursors after tab reentry', async () => {
    const { result, rerender } = renderHook(
      ({ active }) => useRestaurantPhotos(10, active),
      { initialProps: { active: true }, wrapper },
    )
    await waitFor(() => expect(result.current.photos).toHaveLength(20))
    act(() => result.current.selectFilter('review'))
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true))
    await act(async () => {
      await result.current.query.fetchNextPage()
    })
    await waitFor(() => expect(result.current.photos).toHaveLength(21))
    rerender({ active: false })
    await client.invalidateQueries({
      queryKey: ['restaurantPhotos', 10],
      refetchType: 'none',
    })
    getPage.mockClear()
    rerender({ active: true })
    await waitFor(() => expect(result.current.query.isFetching).toBe(false))
    expect(result.current.filter).toBe('review')
    expect(result.current.photos).toHaveLength(20)
    expect(getPage).toHaveBeenCalledTimes(1)
  })

  it('appends pages and resets to the first page when changing filters', async () => {
    const { result } = renderHook(() => useRestaurantPhotos(10, true), {
      wrapper,
    })
    await waitFor(() => expect(result.current.photos).toHaveLength(20))
    await act(async () => {
      await result.current.query.fetchNextPage()
    })
    await waitFor(() => expect(result.current.photos).toHaveLength(21))
    act(() => result.current.selectFilter('menu'))
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true))
    expect(result.current.photos).toHaveLength(0)
    expect(result.current.counts?.all).toBe(21)
    act(() => result.current.selectFilter('all'))
    await waitFor(() => expect(result.current.photos).toHaveLength(20))
  })

  it('keeps loaded photos on a next-page failure and permits retry', async () => {
    const { result } = renderHook(
      () => {
        const model = useRestaurantPhotos(10, true)
        // Subscribe during render, as the photo section does for error state.
        return {
          ...model,
          isFetchNextPageError: model.query.isFetchNextPageError,
        }
      },
      { wrapper },
    )
    await waitFor(() => expect(result.current.photos).toHaveLength(20))
    getPage.mockRejectedValue(new Error('next page failed'))
    await act(async () => {
      await result.current.query.fetchNextPage()
    })
    await waitFor(() => expect(result.current.isFetchNextPageError).toBe(true))
    expect(result.current.photos).toHaveLength(20)
    getPage.mockResolvedValue({ photos: [photo('last')], counts })
    await act(async () => {
      await result.current.query.fetchNextPage()
    })
    await waitFor(() => expect(result.current.photos).toHaveLength(21))
    expect(result.current.isFetchNextPageError).toBe(false)
  })

  it('resets the filter when the recommended restaurant changes', async () => {
    const { result, rerender } = renderHook(
      ({ id }) => useRestaurantPhotos(id, true),
      { initialProps: { id: 10 }, wrapper },
    )
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true))
    act(() => result.current.selectFilter('review'))
    rerender({ id: 20 })
    expect(result.current.filter).toBe('all')
    await waitFor(() => expect(result.current.query.isSuccess).toBe(true))
    rerender({ id: 10 })
    expect(result.current.filter).toBe('all')
  })
})
