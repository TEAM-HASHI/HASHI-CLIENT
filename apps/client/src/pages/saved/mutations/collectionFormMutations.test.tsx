import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearAuthSession,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

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
  afterEach(() => {
    cleanup()
    clearAuthSession()
  })

  it.each(['create', 'update'] as const)(
    'ignores a late %s result after the account changes',
    async (action) => {
      startAuthenticatedSession('account-a', 1)
      let complete!: (value: { collectionId: number; name: string }) => void
      const request = new Promise<{ collectionId: number; name: string }>(
        (resolve) => {
          complete = resolve
        },
      )
      vi.mocked(createCollection).mockReturnValue(request)
      vi.mocked(updateCollection).mockReturnValue(request)
      const onError = vi.fn()
      const { client, wrapper } = createWrapper()
      const { result } = renderHook(
        () => ({
          create: useCreateCollectionMutation(onError),
          update: useUpdateCollectionMutation(onError),
        }),
        { wrapper },
      )
      let pending!: Promise<unknown>
      await act(async () => {
        pending = (
          action === 'create'
            ? result.current.create.mutateAsync({
                name: 'A 생성',
                color: 'red',
                visibility: 'private',
              })
            : result.current.update.mutateAsync({
                collectionId: 42,
                body: { name: 'A 수정' },
              })
        ).catch((error) => error)
      })
      await waitFor(() =>
        expect(
          action === 'create' ? createCollection : updateCollection,
        ).toHaveBeenCalled(),
      )
      act(() => startAuthenticatedSession('account-b', 2))
      const key = collectionQueryKeys.detail(42)
      client.setQueryData(key, { collectionId: 42, name: 'B 데이터' })
      await act(async () => {
        complete({ collectionId: 42, name: 'A 늦은 응답' })
        expect(await pending).toBeInstanceOf(Error)
      })
      expect(client.getQueryData(key)).toEqual({
        collectionId: 42,
        name: 'B 데이터',
      })
      expect(client.getQueryState(key)?.isInvalidated).toBe(false)
      expect(onError).not.toHaveBeenCalled()
    },
  )

  it('does not commit a header if the session changes while cache cancellation is awaited', async () => {
    startAuthenticatedSession('account-a', 1)
    const { client, wrapper } = createWrapper()
    let finishCancel!: () => void
    const cancel = vi.spyOn(client, 'cancelQueries').mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishCancel = resolve
        }),
    )
    vi.mocked(updateCollection).mockResolvedValue({
      collectionId: 42,
      name: 'A 수정',
    })
    const onError = vi.fn()
    const { result } = renderHook(() => useUpdateCollectionMutation(onError), {
      wrapper,
    })
    let pending!: Promise<unknown>
    await act(async () => {
      pending = result.current
        .mutateAsync({ collectionId: 42, body: { name: 'A 수정' } })
        .catch((error) => error)
    })
    await waitFor(() => expect(cancel).toHaveBeenCalled())
    act(() => startAuthenticatedSession('account-b', 2))
    const key = collectionQueryKeys.detail(42)
    client.setQueryData(key, { collectionId: 42, name: 'B 데이터' })
    await act(async () => {
      finishCancel()
      expect(await pending).toBeInstanceOf(Error)
    })
    expect(client.getQueryData(key)).toEqual({
      collectionId: 42,
      name: 'B 데이터',
    })
    expect(onError).not.toHaveBeenCalled()
    cancel.mockRestore()
  })

  it('suppresses a previous session failure without hiding current-session errors', async () => {
    startAuthenticatedSession('account-a', 1)
    let reject!: (error: Error) => void
    vi.mocked(updateCollection).mockReturnValue(
      new Promise((_resolve, rejectRequest) => {
        reject = rejectRequest
      }),
    )
    const { wrapper } = createWrapper()
    const onError = vi.fn()
    const { result, rerender } = renderHook(
      () => useUpdateCollectionMutation(onError),
      { wrapper },
    )
    let pending!: Promise<unknown>
    await act(async () => {
      pending = result.current
        .mutateAsync({ collectionId: 42, body: {} })
        .catch((error) => error)
    })
    await waitFor(() => expect(updateCollection).toHaveBeenCalled())
    act(() => startAuthenticatedSession('account-b', 2))
    await act(async () => {
      reject(new Error('old request failed'))
      await pending
    })
    expect(onError).not.toHaveBeenCalled()
    rerender()
    const failure = new Error('current request failed')
    vi.mocked(updateCollection).mockRejectedValue(failure)
    await act(async () => {
      await expect(
        result.current.mutateAsync({ collectionId: 42, body: {} }),
      ).rejects.toBe(failure)
    })
    expect(onError).toHaveBeenCalledOnce()
    expect(onError).toHaveBeenCalledWith(failure)
  })

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
