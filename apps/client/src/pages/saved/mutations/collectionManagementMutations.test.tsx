import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearAuthSession,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

import { deleteCollection } from '@/pages/saved/api/deleteCollection'
import { moveSavedRestaurants } from '@/pages/saved/api/moveSavedRestaurants'
import { removeSavedRestaurants } from '@/pages/saved/api/removeSavedRestaurants'
import { saveRestaurant } from '@/pages/saved/api/saveRestaurant'
import { collectionQueryKeys } from '@/pages/saved/queries/collectionQueryKeys'
import {
  useDeleteCollectionMutation,
  useMoveSavedRestaurantsMutation,
  useRemoveSavedRestaurantsMutation,
  useSaveRestaurantMutation,
} from '@/pages/saved/mutations/useCollectionManagementMutations'

vi.mock('@/pages/saved/api/deleteCollection', () => ({
  deleteCollection: vi.fn(),
}))
vi.mock('@/pages/saved/api/moveSavedRestaurants', () => ({
  moveSavedRestaurants: vi.fn(),
}))
vi.mock('@/pages/saved/api/removeSavedRestaurants', () => ({
  removeSavedRestaurants: vi.fn(),
}))
vi.mock('@/pages/saved/api/saveRestaurant', () => ({ saveRestaurant: vi.fn() }))

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

  it.each(['save', 'remove', 'move', 'delete'] as const)(
    'does not update the next account after late %s success',
    async (action) => {
      startAuthenticatedSession('account-a', 1)
      let complete!: () => void
      const request = new Promise<void>((resolve) => {
        complete = resolve
      })
      const detail = { collectionId: 42, savedCount: 2 }
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
          save: useSaveRestaurantMutation(onError),
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
                collectionId: 42,
                body: { restaurantId: 5 },
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
      for (const key of [latest, cafes, other, targetList])
        client.setQueryData(key, { pages: [] })
      const updated = { collectionId: 42, savedCount: 2 }
      vi.mocked(saveRestaurant).mockResolvedValue(updated)
      vi.mocked(removeSavedRestaurants).mockResolvedValue(updated)
      const { result } = renderHook(
        () => ({
          save: useSaveRestaurantMutation(),
          remove: useRemoveSavedRestaurantsMutation(),
        }),
        { wrapper },
      )
      await act(async () => {
        if (action === 'save')
          await result.current.save.mutateAsync({
            collectionId: 42,
            body: { restaurantId: 5 },
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
