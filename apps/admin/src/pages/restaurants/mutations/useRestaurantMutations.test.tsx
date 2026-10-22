import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { restaurantApi } from '@/shared/api/restaurantApi'
import { restaurantQueryKeys } from '@/pages/restaurants/queries/restaurantQueryKeys'
import {
  useDeleteRestaurantMutation,
  useUpdateRestaurantMutation,
} from '@/pages/restaurants/mutations/useRestaurantMutations'

vi.mock('@/shared/api/restaurantApi', () => ({
  restaurantApi: { deleteRestaurant: vi.fn(), updateRestaurant: vi.fn() },
}))

describe('restaurant mutations', () => {
  beforeEach(() => {
    vi.mocked(restaurantApi.deleteRestaurant).mockResolvedValue(undefined)
    vi.mocked(restaurantApi.updateRestaurant).mockResolvedValue({
      restaurantId: 12,
    })
  })

  it('invalidates public restaurant lists after delete', async () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(useDeleteRestaurantMutation, { wrapper })

    act(() => result.current.mutate(12))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: restaurantQueryKeys.lists(),
    })
  })
  it('marks only the saved restaurant prefill stale without refreshing an open form, and reloads it when reopened', async () => {
    const client = new QueryClient()
    const key = restaurantQueryKeys.prefill(12, null)
    const other = restaurantQueryKeys.prefill(13, null)
    const variant = restaurantQueryKeys.prefill(12, {
      restaurantId: 12,
      name: '식당',
    })
    client.setQueryData(key, { address: '기존 주소' })
    client.setQueryData(other, { address: '다른 식당 주소' })
    client.setQueryData(variant, { address: '기존 주소' })
    const fetchPrefill = vi.fn(async () => ({ address: '저장한 주소' }))
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result, unmount } = renderHook(
      () => ({
        mutation: useUpdateRestaurantMutation(),
        prefill: useQuery({
          queryKey: key,
          queryFn: fetchPrefill,
          staleTime: Infinity,
        }),
      }),
      { wrapper },
    )
    let finish!: (value: { address: string }) => void
    let pending!: Promise<unknown>
    act(() => {
      pending = client
        .fetchQuery({
          queryKey: key,
          queryFn: () =>
            new Promise<{ address: string }>((resolve) => {
              finish = resolve
            }),
          staleTime: 0,
        })
        .catch(() => undefined)
    })
    await act(async () => {
      await result.current.mutation.mutateAsync({
        restaurantId: 12,
        input: { address: '저장한 주소' },
      })
    })
    await act(async () => {
      finish({ address: '늦게 도착한 이전 주소' })
      await pending
    })
    expect(fetchPrefill).not.toHaveBeenCalled()
    expect(result.current.prefill.data).toEqual({ address: '기존 주소' })
    expect(client.getQueryState(key)?.isInvalidated).toBe(true)
    expect(client.getQueryState(variant)?.isInvalidated).toBe(true)
    expect(client.getQueryState(other)?.isInvalidated).toBe(false)
    unmount()
    const reopened = renderHook(
      () =>
        useQuery({ queryKey: key, queryFn: fetchPrefill, staleTime: Infinity }),
      { wrapper },
    )
    await waitFor(() =>
      expect(reopened.result.current.data).toEqual({ address: '저장한 주소' }),
    )
    expect(fetchPrefill).toHaveBeenCalledTimes(1)
  })
})
