import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createCollection } from '@/pages/saved/api/createCollection'
import { updateCollection } from '@/pages/saved/api/updateCollection'
import { collectionQueryKeys } from '@/pages/saved/queries/collectionQueryKeys'
import {
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
} from '@/pages/saved/mutations/useCollectionFormMutations'

vi.mock('@/pages/saved/api/createCollection', () => ({
  createCollection: vi.fn(),
}))
vi.mock('@/pages/saved/api/updateCollection', () => ({
  updateCollection: vi.fn(),
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

describe('collection form mutation cache synchronization', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })
  afterEach(cleanup)

  it('caches the server-created identity and invalidates both normal and target lists', async () => {
    const detail = { collectionId: 42, name: '여행' }
    vi.mocked(createCollection).mockResolvedValue(detail)
    const { client, wrapper } = createWrapper()
    const list = collectionQueryKeys.infiniteList({})
    const targetList = collectionQueryKeys.infiniteList({ restaurantId: 5 })
    client.setQueryData(list, { pages: [] })
    client.setQueryData(targetList, { pages: [] })
    client.setQueryData(['unrelated'], 'keep')
    const { result } = renderHook(() => useCreateCollectionMutation(), {
      wrapper,
    })
    await act(async () => {
      await result.current.mutateAsync({
        name: '여행',
        color: 'red',
        visibility: 'private',
      })
    })
    expect(client.getQueryData(collectionQueryKeys.detail(42))).toBe(detail)
    expect(client.getQueryState(list)?.isInvalidated).toBe(true)
    expect(client.getQueryState(targetList)?.isInvalidated).toBe(true)
    expect(client.getQueryState(['unrelated'])?.isInvalidated).toBe(false)
  })

  it('cancels a stale detail request before replacing the edited header', async () => {
    const { client, wrapper } = createWrapper()
    const key = collectionQueryKeys.detail(42)
    const old = { collectionId: 42, name: '이전' }
    const updated = { collectionId: 42, name: '수정' }
    client.setQueryData(key, old)
    let completeOldRequest!: (value: typeof old) => void
    const oldFetch = client
      .fetchQuery({
        queryKey: key,
        queryFn: () =>
          new Promise<typeof old>((resolve) => {
            completeOldRequest = resolve
          }),
        staleTime: 0,
      })
      .catch(() => undefined)
    vi.mocked(updateCollection).mockResolvedValue(updated)
    const { result } = renderHook(() => useUpdateCollectionMutation(), {
      wrapper,
    })
    await act(async () => {
      await result.current.mutateAsync({
        collectionId: 42,
        body: { name: '수정' },
      })
      completeOldRequest(old)
      await oldFetch
    })
    expect(client.getQueryData(key)).toEqual(updated)
  })

  it('keeps existing data unchanged while pending and after a rejected update', async () => {
    const { client, wrapper } = createWrapper()
    const old = { collectionId: 42, name: '이전' }
    const key = collectionQueryKeys.detail(42)
    client.setQueryData(key, old)
    const failure = new Error('conflict')
    let rejectRequest!: (error: Error) => void
    vi.mocked(updateCollection).mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectRequest = reject
        }),
    )
    const { result } = renderHook(() => useUpdateCollectionMutation(), {
      wrapper,
    })
    await act(async () => {
      const pending = result.current.mutateAsync({
        collectionId: 42,
        body: { name: '새 이름' },
      })
      await Promise.resolve()
      expect(client.getQueryData(key)).toBe(old)
      rejectRequest(failure)
      await expect(pending).rejects.toBe(failure)
    })
    expect(client.getQueryData(key)).toBe(old)
    expect(client.getQueryState(key)?.isInvalidated).toBe(false)
  })
})
