import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import {
  getMapRestaurantSaveCounts,
  getMyMapRestaurantSaves,
} from '@/pages/map/api/getMapRestaurantSaves'
import { useMapRestaurantSaves } from '@/pages/map/hooks/useMapRestaurantSaves'
import type { MapRestaurant } from '@/pages/map/types'
import {
  clearAuthSession,
  setAccessToken,
  setOnboardingSession,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

vi.mock('@/pages/map/api/getMapRestaurantSaves', () => ({
  getMapRestaurantSaveCounts: vi.fn(),
  getMyMapRestaurantSaves: vi.fn(),
}))
const restaurant: MapRestaurant = {
  id: '10',
  name: '식당',
  areaCode: 'ueno',
  category: 'restaurant',
  cuisine: '일식',
  rating: 4,
  reviewCount: 0,
  recommendationRank: 1,
  menuKeywords: [],
  images: [],
  hours: '',
  price: '',
  description: '',
  address: '',
  position: { lat: 35.7, lng: 139.7 },
}
let client: QueryClient
const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
)

beforeEach(() => {
  clearAuthSession()
  vi.resetAllMocks()
  client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, throwOnError: true },
    },
  })
  vi.mocked(getMapRestaurantSaveCounts).mockResolvedValue({ 10: 7, 20: 0 })
  vi.mocked(getMyMapRestaurantSaves).mockResolvedValue({ 10: true })
})
afterEach(() => {
  cleanup()
  client.clear()
  clearAuthSession()
})

it.each(['guest', 'onboarding'])(
  'only reads public counts for %s and keeps missing counts undefined',
  async (status) => {
    if (status === 'onboarding') setOnboardingSession()
    const { result } = renderHook(
      () =>
        useMapRestaurantSaves([
          restaurant,
          { ...restaurant, id: '30' },
          { ...restaurant, id: '20' },
        ]),
      { wrapper },
    )
    await waitFor(() => expect(result.current[0].saveCount).toBe(7))
    expect(
      result.current.map(({ id, saveCount, saved }) => ({
        id,
        saveCount,
        saved,
      })),
    ).toEqual([
      { id: '10', saveCount: 7, saved: false },
      { id: '30', saveCount: undefined, saved: false },
      { id: '20', saveCount: 0, saved: false },
    ])
    expect(getMyMapRestaurantSaves).not.toHaveBeenCalled()
  },
)

it('normalizes duplicate and reordered IDs to the same cache entry', async () => {
  const initial = [restaurant, { ...restaurant, id: '20' }, restaurant]
  const { result, rerender } = renderHook(
    ({ items }) => useMapRestaurantSaves(items),
    { wrapper, initialProps: { items: initial } },
  )
  await waitFor(() => expect(result.current[0].saveCount).toBe(7))
  expect(getMapRestaurantSaveCounts).toHaveBeenCalledWith(
    [10, 20],
    expect.any(AbortSignal),
  )
  rerender({ items: [...initial].reverse() })
  expect(getMapRestaurantSaveCounts).toHaveBeenCalledTimes(1)
  expect(initial[0].saveCount).toBeUndefined()
})

it('isolates saved data across authentication sessions but not token refreshes', async () => {
  startAuthenticatedSession('account-a')
  const { result } = renderHook(() => useMapRestaurantSaves([restaurant]), {
    wrapper,
  })
  await waitFor(() => expect(result.current[0].saved).toBe(true))
  act(() => setAccessToken('refreshed-token'))
  expect(result.current[0].saved).toBe(true)
  expect(getMyMapRestaurantSaves).toHaveBeenCalledTimes(1)
  act(() => clearAuthSession())
  expect(result.current[0].saved).toBe(false)
  vi.mocked(getMyMapRestaurantSaves).mockResolvedValueOnce({ 10: false })
  act(() => startAuthenticatedSession('account-b'))
  expect(result.current[0].saved).toBe(false)
  await waitFor(() => expect(getMyMapRestaurantSaves).toHaveBeenCalledTimes(2))
  expect(result.current[0].saveCount).toBe(7)
  expect(getMapRestaurantSaveCounts).toHaveBeenCalledTimes(1)
  expect(
    JSON.stringify(
      client
        .getQueryCache()
        .getAll()
        .map(({ queryKey }) => queryKey),
    ),
  ).not.toContain('account-')
})

it('aborts and ignores a late saved response from an old account', async () => {
  startAuthenticatedSession('account-a')
  let resolveOld: (saved: Record<number, boolean>) => void = () => {}
  vi.mocked(getMyMapRestaurantSaves).mockReturnValueOnce(
    new Promise((resolve) => {
      resolveOld = resolve
    }),
  )
  const { result } = renderHook(() => useMapRestaurantSaves([restaurant]), {
    wrapper,
  })
  await waitFor(() => expect(result.current[0].saveCount).toBe(7))
  const oldSignal = vi.mocked(getMyMapRestaurantSaves).mock.calls[0][1]
  vi.mocked(getMyMapRestaurantSaves).mockResolvedValueOnce({ 10: false })
  act(() => startAuthenticatedSession('account-b'))
  await waitFor(() => expect(getMyMapRestaurantSaves).toHaveBeenCalledTimes(2))
  expect(oldSignal?.aborted).toBe(true)
  await act(async () => resolveOld({ 10: true }))
  expect(result.current[0].saved).toBe(false)
})

it('keeps failed optional reads local and does not retain supplied stale saved flags', async () => {
  startAuthenticatedSession('account-a')
  vi.mocked(getMapRestaurantSaveCounts).mockRejectedValueOnce(
    new Error('counts unavailable'),
  )
  vi.mocked(getMyMapRestaurantSaves).mockRejectedValueOnce(
    new Error('saved unavailable'),
  )
  const { result } = renderHook(
    () =>
      useMapRestaurantSaves([{ ...restaurant, saveCount: 99, saved: true }]),
    { wrapper },
  )
  await waitFor(() => expect(client.isFetching()).toBe(0))
  expect(result.current[0].saveCount).toBeUndefined()
  expect(result.current[0].saved).toBe(false)
})

it('does not request empty or invalid restaurant identifiers', async () => {
  const { rerender } = renderHook(({ items }) => useMapRestaurantSaves(items), {
    wrapper,
    initialProps: { items: [] as MapRestaurant[] },
  })
  rerender({ items: [{ ...restaurant, id: 'invalid' }] })
  expect(getMapRestaurantSaveCounts).not.toHaveBeenCalled()
  expect(getMyMapRestaurantSaves).not.toHaveBeenCalled()
})
