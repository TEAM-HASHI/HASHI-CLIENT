import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getCollection } from '@/pages/saved/api/getCollection'
import { getCollections } from '@/pages/saved/api/getCollections'
import { getSavedRestaurants } from '@/pages/saved/api/getSavedRestaurants'
import { collectionQueryKeys } from '@/pages/saved/queries/collectionQueryKeys'
import { useCollectionQuery } from '@/pages/saved/queries/useCollectionQuery'
import { useCollectionsInfiniteQuery } from '@/pages/saved/queries/useCollectionsInfiniteQuery'
import { useSavedRestaurantsInfiniteQuery } from '@/pages/saved/queries/useSavedRestaurantsInfiniteQuery'
import type { CollectionCategory, CollectionSort } from '@/pages/saved/types'

vi.mock('@/pages/saved/api/getCollection', () => ({ getCollection: vi.fn() }))
vi.mock('@/pages/saved/api/getCollections', () => ({ getCollections: vi.fn() }))
vi.mock('@/pages/saved/api/getSavedRestaurants', () => ({
  getSavedRestaurants: vi.fn(),
}))

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, wrapper: Wrapper }
}

describe('collection query keys', () => {
  it('separates detail, list, restaurant and all response-changing filters', () => {
    expect(collectionQueryKeys.detail(8)).not.toEqual(
      collectionQueryKeys.infiniteList({}),
    )
    expect(
      collectionQueryKeys.infiniteList({ restaurantId: 5, size: 10 }),
    ).not.toEqual(
      collectionQueryKeys.infiniteList({ restaurantId: 6, size: 10 }),
    )
    expect(collectionQueryKeys.infiniteList({ size: 10 })).not.toEqual(
      collectionQueryKeys.infiniteList({ size: 20 }),
    )
    expect(collectionQueryKeys.restaurants(8, { sort: 'latest' })).not.toEqual(
      collectionQueryKeys.restaurants(9, { sort: 'latest' }),
    )
    expect(collectionQueryKeys.restaurants(8, { sort: 'latest' })).not.toEqual(
      collectionQueryKeys.restaurants(8, { sort: 'review', placeType: 'cafe' }),
    )
    expect(collectionQueryKeys.restaurants(8, { size: 10 })).not.toEqual(
      collectionQueryKeys.restaurants(8, { size: 20 }),
    )
  })
})

describe('collection read hooks', () => {
  beforeEach(() => vi.resetAllMocks())
  afterEach(cleanup)

  it('requests the detail, shares its factory key and exposes the unmodified DTO', async () => {
    const detail = { collectionId: 8, owner: true }
    vi.mocked(getCollection).mockResolvedValue(detail)
    const { client, wrapper } = createWrapper()
    const { result } = renderHook(() => useCollectionQuery(8), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getCollection).toHaveBeenCalledWith(8, expect.any(AbortSignal))
    expect(client.getQueryData(collectionQueryKeys.detail(8))).toEqual(detail)
  })

  it.each([null, 0, -1, NaN, 1.5])(
    'disables detail and restaurant queries for invalid collection ID %s',
    (id) => {
      const { wrapper } = createWrapper()
      const { result } = renderHook(
        () => ({
          detail: useCollectionQuery(id),
          restaurants: useSavedRestaurantsInfiniteQuery(id),
        }),
        { wrapper },
      )
      expect(result.current.detail.fetchStatus).toBe('idle')
      expect(result.current.restaurants.fetchStatus).toBe('idle')
      expect(getCollection).not.toHaveBeenCalled()
      expect(getSavedRestaurants).not.toHaveBeenCalled()
    },
  )

  it('allows callers to disable protected lists and restaurant queries', () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => ({
        list: useCollectionsInfiniteQuery(null),
        restaurants: useSavedRestaurantsInfiniteQuery(8, null),
      }),
      { wrapper },
    )
    expect(result.current.list.fetchStatus).toBe('idle')
    expect(result.current.restaurants.fetchStatus).toBe('idle')
    expect(getCollections).not.toHaveBeenCalled()
    expect(getSavedRestaurants).not.toHaveBeenCalled()
  })

  it('does not issue requests even when disabled queries are manually refetched', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => ({
        detail: { ...useCollectionQuery(null) },
        list: { ...useCollectionsInfiniteQuery(null) },
        restaurants: { ...useSavedRestaurantsInfiniteQuery(8, null) },
      }),
      { wrapper },
    )
    await act(async () => {
      await Promise.all([
        result.current.detail.refetch(),
        result.current.list.refetch(),
        result.current.restaurants.refetch(),
      ])
    })
    await waitFor(() => {
      expect(result.current.detail.isError).toBe(true)
      expect(result.current.list.isError).toBe(true)
      expect(result.current.restaurants.isError).toBe(true)
    })
    expect(getCollection).not.toHaveBeenCalled()
    expect(getCollections).not.toHaveBeenCalled()
    expect(getSavedRestaurants).not.toHaveBeenCalled()
  })

  it('aborts the request signal when a detail consumer unmounts', async () => {
    vi.mocked(getCollection).mockImplementation(() => new Promise(() => {}))
    const { wrapper } = createWrapper()
    const { unmount } = renderHook(() => useCollectionQuery(8), { wrapper })
    await waitFor(() => expect(getCollection).toHaveBeenCalledTimes(1))
    const signal = vi.mocked(getCollection).mock.calls[0][1]
    expect(signal?.aborted).toBe(false)
    unmount()
    expect(signal?.aborted).toBe(true)
  })

  it('fetches numeric collection pages and stops when hasNext is false even with a cursor', async () => {
    vi.mocked(getCollections)
      .mockResolvedValueOnce({
        collections: [{ collectionId: 8 }],
        totalCount: 42,
        hasNext: true,
        nextCursor: 8,
      })
      .mockResolvedValueOnce({
        collections: [{ collectionId: 7 }],
        totalCount: 42,
        hasNext: false,
        nextCursor: 7,
      })
    const { wrapper } = createWrapper()
    const { result } = renderHook(
      () => useCollectionsInfiniteQuery({ restaurantId: 5, size: 1 }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.hasNextPage).toBe(true)
    await act(async () => {
      await result.current.fetchNextPage()
    })
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))
    expect(getCollections).toHaveBeenNthCalledWith(
      1,
      { restaurantId: 5, size: 1 },
      expect.any(AbortSignal),
    )
    expect(getCollections).toHaveBeenNthCalledWith(
      2,
      { restaurantId: 5, size: 1, cursor: 8 },
      expect.any(AbortSignal),
    )
    expect(result.current.hasNextPage).toBe(false)
    expect(result.current.data?.pages[0].totalCount).toBe(42)
    await act(async () => {
      await result.current.fetchNextPage()
    })
    expect(getCollections).toHaveBeenCalledTimes(2)
  })

  it('uses string restaurant cursors and starts a fresh page when filters change', async () => {
    vi.mocked(getSavedRestaurants)
      .mockResolvedValueOnce({
        content: [{ restaurantId: 5 }],
        hasNext: true,
        nextCursor: 'opaque-next',
      })
      .mockResolvedValueOnce({ content: [{ restaurantId: 6 }], hasNext: false })
      .mockResolvedValueOnce({ content: [{ restaurantId: 7 }], hasNext: false })
    const { wrapper } = createWrapper()
    const { result, rerender } = renderHook(
      ({
        sort,
        category,
      }: {
        sort: CollectionSort
        category: CollectionCategory
      }) => ({
        ...useSavedRestaurantsInfiniteQuery(8, { sort, category, size: 1 }),
      }),
      {
        wrapper,
        initialProps: { sort: 'reviews', category: 'all' },
      },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    await act(async () => {
      await result.current.fetchNextPage()
    })
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))
    expect(getSavedRestaurants).toHaveBeenNthCalledWith(
      1,
      8,
      { sort: 'review', size: 1 },
      expect.any(AbortSignal),
    )
    expect(getSavedRestaurants).toHaveBeenNthCalledWith(
      2,
      8,
      { sort: 'review', size: 1, cursor: 'opaque-next' },
      expect.any(AbortSignal),
    )
    rerender({ sort: 'rating', category: 'cafe' })
    await waitFor(() =>
      expect(result.current.data?.pages[0].content?.[0].restaurantId).toBe(7),
    )
    expect(result.current.data?.pages).toHaveLength(1)
    expect(getSavedRestaurants).toHaveBeenNthCalledWith(
      3,
      8,
      { sort: 'rating', placeType: 'cafe', size: 1 },
      expect.any(AbortSignal),
    )
    expect(result.current.hasNextPage).toBe(false)
  })

  it('exposes an initial error without returning an empty successful page', async () => {
    const error = Object.assign(new Error('unauthorized'), { status: 401 })
    vi.mocked(getCollections).mockRejectedValue(error)
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useCollectionsInfiniteQuery({}), {
      wrapper,
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBe(error)
    expect(result.current.data).toBeUndefined()
  })

  it('keeps already loaded restaurant pages after a next-page failure and permits retry', async () => {
    const error = new Error('network failure')
    vi.mocked(getSavedRestaurants)
      .mockResolvedValueOnce({
        content: [{ restaurantId: 5 }],
        hasNext: true,
        nextCursor: 'next',
      })
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({ content: [{ restaurantId: 6 }], hasNext: false })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useSavedRestaurantsInfiniteQuery(8), {
      wrapper,
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    await act(async () => {
      await result.current.fetchNextPage()
    })
    await waitFor(() => expect(result.current.isFetchNextPageError).toBe(true))
    expect(result.current.data?.pages).toHaveLength(1)
    expect(result.current.error).toBe(error)
    await act(async () => {
      await result.current.fetchNextPage()
    })
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))
    expect(result.current.hasNextPage).toBe(false)
  })
})
