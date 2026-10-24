import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearAuthSession,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

import { deleteCollection } from '@/features/collection/api/deleteCollection'
import { getCollections } from '@/features/collection/api/getCollections'
import { ApiError } from '@/shared/api/apiError'
import { moveSavedRestaurants } from '@/features/collection/api/moveSavedRestaurants'
import { removeSavedRestaurants } from '@/features/collection/api/removeSavedRestaurants'
import { saveRestaurant } from '@/features/collection/api/saveRestaurant'
import {
  collectionQueryKeys,
  restaurantSaveQueryKeys,
} from '@/features/collection/queries/collectionQueryKeys'
import { restaurantDetailQueryKeys } from '@/features/restaurantDetail/queries/restaurantDetailQueryKeys'
import {
  useDeleteCollectionMutation,
  useMoveSavedRestaurantsMutation,
  useRemoveSavedRestaurantsMutation,
  useUpdateRestaurantCollectionsMutation,
} from '@/features/collection/mutations/useCollectionManagementMutations'

vi.mock('@/features/collection/api/deleteCollection', () => ({
  deleteCollection: vi.fn(),
}))
vi.mock('@/features/collection/api/getCollections', () => ({
  getCollections: vi.fn(),
}))
vi.mock('@/features/collection/api/moveSavedRestaurants', () => ({
  moveSavedRestaurants: vi.fn(),
}))
vi.mock('@/features/collection/api/removeSavedRestaurants', () => ({
  removeSavedRestaurants: vi.fn(),
}))
vi.mock('@/features/collection/api/saveRestaurant', () => ({
  saveRestaurant: vi.fn(),
}))

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, wrapper }
}

describe('collection management mutation cache synchronization', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })
  afterEach(() => {
    cleanup()
    clearAuthSession()
  })

  it.each([true, false])(
    'skips an already-applied saved=%s change and refreshes once for the batch',
    async (saved) => {
      startAuthenticatedSession('account-a', 1)
      vi.mocked(getCollections).mockResolvedValue({
        collections: [
          { collectionId: 42, saved },
          { collectionId: 43, saved: false },
          { collectionId: 44, saved: false },
        ],
        hasNext: false,
      })
      vi.mocked(saveRestaurant).mockImplementation(async (collectionId) => ({
        collectionId,
      }))
      const { client, wrapper } = createWrapper()
      const invalidate = vi.spyOn(client, 'invalidateQueries')
      const { result } = renderHook(
        () => useUpdateRestaurantCollectionsMutation(),
        { wrapper },
      )
      await act(async () => {
        const outcome = await result.current.mutateAsync({
          restaurantId: 5,
          changes: { 42: saved, 43: true, 44: true },
        })
        expect(outcome.completedIds).toEqual(['42', '43', '44'])
        expect(outcome.error).toBeNull()
      })
      expect(vi.mocked(saveRestaurant).mock.calls.map(([id]) => id)).toEqual([
        43, 44,
      ])
      expect(removeSavedRestaurants).not.toHaveBeenCalled()
      expect(
        invalidate.mock.calls.filter(
          ([options]) =>
            JSON.stringify(options?.queryKey) ===
            JSON.stringify(collectionQueryKeys.lists()),
        ),
      ).toHaveLength(1)
      expect(
        invalidate.mock.calls.filter(
          ([options]) =>
            JSON.stringify(options?.queryKey) ===
            JSON.stringify(restaurantSaveQueryKeys.all()),
        ),
      ).toHaveLength(1)
      client.clear()
    },
  )

  it.each([true, false])(
    'reconciles a concurrent saved=%s change after the initial read',
    async (saved) => {
      startAuthenticatedSession('account-a', 1)
      vi.mocked(getCollections)
        .mockResolvedValueOnce({
          collections: [{ collectionId: 42, saved: !saved }],
          hasNext: false,
        })
        .mockResolvedValue({
          collections: [{ collectionId: 42, saved }],
          hasNext: false,
        })
      const error = new ApiError(
        {
          success: false,
          code: saved ? 'USER-012' : 'USER-013',
          message: '이미 변경됨',
          data: null,
          timestamp: '2026-10-24T00:00:00Z',
          path: '/api/v1/collections/42/restaurants',
        },
        saved ? 409 : 404,
      )
      vi.mocked(saveRestaurant).mockRejectedValue(error)
      vi.mocked(removeSavedRestaurants).mockRejectedValue(error)
      const { client, wrapper } = createWrapper()
      const { result } = renderHook(
        () => useUpdateRestaurantCollectionsMutation(),
        { wrapper },
      )
      await act(async () => {
        const outcome = await result.current.mutateAsync({
          restaurantId: 5,
          changes: { 42: saved },
        })
        expect(outcome.completedIds).toEqual(['42'])
        expect(outcome.error).toBeNull()
      })
      expect(
        saved ? saveRestaurant : removeSavedRestaurants,
      ).toHaveBeenCalledOnce()
      client.clear()
    },
  )

  it.each(['save', 'remove', 'move', 'delete'] as const)(
    'does not update the next account after late %s success',
    async (action) => {
      startAuthenticatedSession('account-a', 1)
      let complete!: () => void
      const request = new Promise<void>((resolve) => {
        complete = resolve
      })
      const detail = { collectionId: 42, savedCount: 2 }
      vi.mocked(getCollections).mockResolvedValue({
        collections: [
          { collectionId: 42, saved: false },
          { collectionId: 43, saved: false },
        ],
        hasNext: false,
      })
      vi.mocked(saveRestaurant).mockImplementation(async () => {
        await request
        return detail
      })
      vi.mocked(removeSavedRestaurants).mockImplementation(async () => {
        await request
        return detail
      })
      vi.mocked(moveSavedRestaurants).mockImplementation(async () => {
        await request
        return {
          sourceCollection: detail,
          targetCollection: { collectionId: 43 },
        }
      })
      vi.mocked(deleteCollection).mockImplementation(async () => {
        await request
      })
      const onError = vi.fn()
      const { client, wrapper } = createWrapper()
      const { result } = renderHook(
        () => ({
          save: useUpdateRestaurantCollectionsMutation(onError),
          remove: useRemoveSavedRestaurantsMutation(onError),
          move: useMoveSavedRestaurantsMutation(onError),
          delete: useDeleteCollectionMutation(onError),
        }),
        { wrapper },
      )
      let pending!: Promise<unknown>
      await act(async () => {
        pending = (
          action === 'save'
            ? result.current.save.mutateAsync({
                restaurantId: 5,
                changes: { 42: true, 43: true },
              })
            : action === 'remove'
              ? result.current.remove.mutateAsync({
                  collectionId: 42,
                  restaurantIds: [5],
                })
              : action === 'move'
                ? result.current.move.mutateAsync({
                    collectionId: 42,
                    body: { targetCollectionId: 43, restaurantIds: [5] },
                  })
                : result.current.delete.mutateAsync(42)
        ).catch((error) => error)
      })
      await waitFor(() =>
        expect(
          {
            save: saveRestaurant,
            remove: removeSavedRestaurants,
            move: moveSavedRestaurants,
            delete: deleteCollection,
          }[action],
        ).toHaveBeenCalled(),
      )
      act(() => startAuthenticatedSession('account-b', 2))
      const detailKey = collectionQueryKeys.detail(42)
      const listKey = collectionQueryKeys.infiniteList({})
      client.setQueryData(detailKey, { collectionId: 42, name: 'B 데이터' })
      client.setQueryData(listKey, { pages: [] })
      await act(async () => {
        complete()
        expect(await pending).toBeInstanceOf(Error)
      })
      expect(client.getQueryData(detailKey)).toEqual({
        collectionId: 42,
        name: 'B 데이터',
      })
      expect(client.getQueryState(listKey)?.isInvalidated).toBe(false)
      expect(onError).not.toHaveBeenCalled()
    },
  )

  it.each(['save', 'remove'] as const)(
    'refreshes all filters of the affected restaurant list after %s',
    async (action) => {
      const { client, wrapper } = createWrapper()
      const latest = collectionQueryKeys.restaurants(42, { sort: 'latest' })
      const cafes = collectionQueryKeys.restaurants(42, {
        sort: 'rating',
        placeType: 'cafe',
      })
      const other = collectionQueryKeys.restaurants(43, { sort: 'latest' })
      const targetList = collectionQueryKeys.infiniteList({ restaurantId: 5 })
      const saveCount = restaurantSaveQueryKeys.count(5)
      const saved = restaurantSaveQueryKeys.saved(5, 0)
      const summary = restaurantDetailQueryKeys.summary(5)
      const menus = restaurantDetailQueryKeys.menus(5, 10)
      const recommendation = restaurantDetailQueryKeys.randomRecommendation()
      for (const key of [saveCount, saved, summary, menus, recommendation])
        client.setQueryData(key, { restaurantId: 5 })
      for (const key of [latest, cafes, other, targetList])
        client.setQueryData(key, { pages: [] })
      const updated = { collectionId: 42, savedCount: 2 }
      vi.mocked(saveRestaurant).mockResolvedValue(updated)
      vi.mocked(removeSavedRestaurants).mockResolvedValue(updated)
      vi.mocked(getCollections).mockResolvedValue({
        collections: [{ collectionId: 42, saved: false }],
        hasNext: false,
      })
      const { result } = renderHook(
        () => ({
          save: useUpdateRestaurantCollectionsMutation(),
          remove: useRemoveSavedRestaurantsMutation(),
        }),
        { wrapper },
      )
      await act(async () => {
        if (action === 'save')
          await result.current.save.mutateAsync({
            restaurantId: 5,
            changes: { 42: true },
          })
        else
          await result.current.remove.mutateAsync({
            collectionId: 42,
            restaurantIds: [5],
          })
      })
      expect(client.getQueryData(collectionQueryKeys.detail(42))).toEqual(
        updated,
      )
      for (const key of [latest, cafes, targetList])
        expect(client.getQueryState(key)?.isInvalidated).toBe(true)
      expect(client.getQueryState(other)?.isInvalidated).toBe(false)
      for (const key of [saveCount, saved])
        expect(client.getQueryState(key)?.isInvalidated).toBe(true)
      for (const key of [summary, menus, recommendation])
        expect(client.getQueryState(key)?.isInvalidated).toBe(false)
    },
  )

  it('updates both collection headers and invalidates both restaurant lists after a move', async () => {
    const { client, wrapper } = createWrapper()
    const source = collectionQueryKeys.restaurants(42, { sort: 'latest' })
    const target = collectionQueryKeys.restaurants(43, { sort: 'latest' })
    for (const key of [source, target]) client.setQueryData(key, { pages: [] })
    const response = {
      sourceCollection: { collectionId: 42, savedCount: 1 },
      targetCollection: { collectionId: 43, savedCount: 3 },
    }
    vi.mocked(moveSavedRestaurants).mockResolvedValue(response)
    const { result } = renderHook(() => useMoveSavedRestaurantsMutation(), {
      wrapper,
    })
    await act(async () => {
      await result.current.mutateAsync({
        collectionId: 42,
        body: { targetCollectionId: 43, restaurantIds: [5] },
      })
    })
    expect(client.getQueryData(collectionQueryKeys.detail(42))).toEqual(
      response.sourceCollection,
    )
    expect(client.getQueryData(collectionQueryKeys.detail(43))).toEqual(
      response.targetCollection,
    )
    expect(client.getQueryState(source)?.isInvalidated).toBe(true)
    expect(client.getQueryState(target)?.isInvalidated).toBe(true)
  })

  it('removes only the deleted collection resources and invalidates collection lists', async () => {
    const { client, wrapper } = createWrapper()
    const detail = collectionQueryKeys.detail(42)
    const restaurants = collectionQueryKeys.restaurants(42, { sort: 'latest' })
    const other = collectionQueryKeys.detail(43)
    const lists = collectionQueryKeys.infiniteList({})
    client.setQueryData(detail, { collectionId: 42 })
    client.setQueryData(restaurants, { pages: [] })
    client.setQueryData(other, { collectionId: 43 })
    client.setQueryData(lists, { pages: [] })
    vi.mocked(deleteCollection).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteCollectionMutation(), {
      wrapper,
    })
    await act(async () => {
      await result.current.mutateAsync(42)
    })
    expect(client.getQueryData(detail)).toBeUndefined()
    expect(client.getQueryData(restaurants)).toBeUndefined()
    expect(client.getQueryData(other)).toEqual({ collectionId: 43 })
    expect(client.getQueryState(lists)?.isInvalidated).toBe(true)
  })

  it('keeps data and cache freshness unchanged after a failed move', async () => {
    const { client, wrapper } = createWrapper()
    const key = collectionQueryKeys.restaurants(42, { sort: 'latest' })
    const original = { pages: [{ content: [{ restaurantId: 5 }] }] }
    client.setQueryData(key, original)
    const error = new Error('conflict')
    vi.mocked(moveSavedRestaurants).mockRejectedValue(error)
    const { result } = renderHook(() => useMoveSavedRestaurantsMutation(), {
      wrapper,
    })
    await act(async () => {
      await expect(
        result.current.mutateAsync({
          collectionId: 42,
          body: { targetCollectionId: 43, restaurantIds: [5] },
        }),
      ).rejects.toBe(error)
    })
    expect(client.getQueryData(key)).toEqual(original)
    expect(client.getQueryState(key)?.isInvalidated).toBe(false)
    expect(moveSavedRestaurants).toHaveBeenCalledTimes(1)
  })
})
