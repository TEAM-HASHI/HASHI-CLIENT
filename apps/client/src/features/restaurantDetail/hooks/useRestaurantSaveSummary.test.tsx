import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useRestaurantSaveSummary } from '@/features/restaurantDetail/hooks/useRestaurantSaveSummary'
import { restaurantSaveQueryKeys } from '@/features/restaurantDetail/queries/restaurantSaveQueryOptions'
import { request } from '@/shared/api/request'
import {
  clearAuthSession,
  setAccessToken,
  setOnboardingSession,
} from '@/shared/auth/authSession'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))
const mockedRequest = vi.mocked(request)
let client: QueryClient
const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
)

beforeEach(() => {
  clearAuthSession()
  mockedRequest.mockReset()
  client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        throwOnError: true,
      },
    },
  })
})
afterEach(() => {
  cleanup()
  client.clear()
  clearAuthSession()
})

describe('useRestaurantSaveSummary', () => {
  it.each(['guest', 'onboarding'])(
    'only reads the public count for %s',
    async (status) => {
      if (status === 'onboarding') setOnboardingSession()
      mockedRequest.mockResolvedValue({
        restaurants: [{ restaurantId: 10, saveCount: 7 }],
      })
      const { result } = renderHook(() => useRestaurantSaveSummary(10), {
        wrapper,
      })
      expect(result.current).toEqual({ saveCount: undefined, saved: false })
      await waitFor(() => expect(result.current.saveCount).toBe(7))
      expect(result.current.saved).toBe(false)
      expect(mockedRequest).toHaveBeenCalledTimes(1)
      expect(client.getQueryData(restaurantSaveQueryKeys.count(10))).toEqual({
        saveCount: 7,
      })
    },
  )

  it('isolates saved state across logout and login while sharing the public count', async () => {
    setAccessToken('account-a')
    mockedRequest.mockImplementation(async (path) => ({
      restaurants: [
        path.includes('save-counts')
          ? { restaurantId: 10, saveCount: 7 }
          : { restaurantId: 10, saved: true },
      ],
    }))
    const { result } = renderHook(() => useRestaurantSaveSummary(10), {
      wrapper,
    })
    await waitFor(() => expect(result.current.saved).toBe(true))
    act(() => setAccessToken('account-a-refreshed'))
    expect(result.current).toEqual({ saveCount: 7, saved: true })
    expect(mockedRequest).toHaveBeenCalledTimes(2)
    act(() => clearAuthSession())
    expect(result.current).toEqual({ saveCount: 7, saved: false })
    let resolveSaved!: (value: unknown) => void
    mockedRequest.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSaved = resolve
        }),
    )
    act(() => {
      clearAuthSession()
      setAccessToken('account-b')
    })
    expect(result.current).toEqual({ saveCount: 7, saved: false })
    await act(async () =>
      resolveSaved({ restaurants: [{ restaurantId: 10, saved: false }] }),
    )
    expect(result.current.saved).toBe(false)
    expect(
      mockedRequest.mock.calls.filter(([path]) => path.includes('save-counts')),
    ).toHaveLength(1)
    expect(
      JSON.stringify(
        client
          .getQueryCache()
          .getAll()
          .map((query) => query.queryKey),
      ),
    ).not.toContain('account-')
  })

  it('ignores a late saved response from a previous account', async () => {
    setAccessToken('account-a')
    let resolveOld!: (value: unknown) => void
    mockedRequest.mockImplementation((path) =>
      path.includes('save-counts')
        ? Promise.resolve({ restaurants: [{ restaurantId: 10, saveCount: 7 }] })
        : new Promise((resolve) => {
            resolveOld = resolve
          }),
    )
    const { result } = renderHook(() => useRestaurantSaveSummary(10), {
      wrapper,
    })
    await waitFor(() => expect(result.current.saveCount).toBe(7))
    mockedRequest.mockResolvedValue({
      restaurants: [{ restaurantId: 10, saved: false }],
    })
    act(() => {
      clearAuthSession()
      setAccessToken('account-b')
    })
    await waitFor(() => expect(mockedRequest).toHaveBeenCalledTimes(3))
    await act(async () =>
      resolveOld({ restaurants: [{ restaurantId: 10, saved: true }] }),
    )
    expect(result.current).toEqual({ saveCount: 7, saved: false })
  })

  it('does not reuse saved state after session changes while unmounted', async () => {
    setAccessToken('account-a')
    mockedRequest.mockImplementation(async (path) => ({
      restaurants: [
        path.includes('save-counts')
          ? { restaurantId: 10, saveCount: 7 }
          : { restaurantId: 10, saved: true },
      ],
    }))
    const first = renderHook(() => useRestaurantSaveSummary(10), { wrapper })
    await waitFor(() => expect(first.result.current.saved).toBe(true))
    first.unmount()
    clearAuthSession()
    setAccessToken('account-b')
    mockedRequest.mockResolvedValue({
      restaurants: [{ restaurantId: 10, saved: false }],
    })
    const second = renderHook(() => useRestaurantSaveSummary(10), { wrapper })
    expect(second.result.current).toEqual({ saveCount: 7, saved: false })
    await waitFor(() => expect(client.isFetching()).toBe(0))
    expect(second.result.current.saved).toBe(false)
    expect(mockedRequest).toHaveBeenCalledTimes(3)
  })

  it('successfully caches an omitted count without turning it into zero', async () => {
    mockedRequest.mockResolvedValue({ restaurants: [] })
    const { result } = renderHook(() => useRestaurantSaveSummary(10), {
      wrapper,
    })
    await waitFor(() =>
      expect(
        client.getQueryState(restaurantSaveQueryKeys.count(10))?.status,
      ).toBe('success'),
    )
    expect(result.current).toEqual({ saveCount: undefined, saved: false })
  })

  it('keeps optional read failures local without inventing a count', async () => {
    setAccessToken('account-a')
    mockedRequest.mockRejectedValue(new Error('optional read failed'))
    const { result } = renderHook(() => useRestaurantSaveSummary(10), {
      wrapper,
    })
    await waitFor(() => expect(client.isFetching()).toBe(0))
    expect(result.current).toEqual({ saveCount: undefined, saved: false })
  })
})
