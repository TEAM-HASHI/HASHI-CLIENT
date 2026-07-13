import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getVisitedReservations } from '@/features/review/api/getVisitedReservations'
import { useVisitedReservationsInfiniteQuery } from '@/features/review/queries/visitedReservations'
import { visitedReservationQueryKeys } from '@/features/review/queries/visitedReservationQueryKeys'

vi.mock('@/features/review/api/getVisitedReservations', () => ({
  getVisitedReservations: vi.fn(),
}))

const params = { reviewStatus: 'unreviewed' as const, size: 20 }

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe('visitedReservations query', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('includes response-changing filters in finite and infinite keys', () => {
    expect(
      visitedReservationQueryKeys.infiniteList({
        restaurantId: 7,
        reviewStatus: 'unreviewed',
        size: 1,
        sort: 'oldest',
      }),
    ).toEqual([
      'reviews',
      'visitedReservations',
      'infiniteList',
      {
        restaurantId: 7,
        reviewStatus: 'unreviewed',
        size: 1,
        sort: 'oldest',
      },
    ])
  })

  it('continues from the server next cursor', async () => {
    vi.mocked(getVisitedReservations)
      .mockResolvedValueOnce({
        content: [{ reservationId: 23, restaurantId: 7 }],
        hasNext: true,
        nextCursor: 23,
        totalCount: 2,
      })
      .mockResolvedValueOnce({
        content: [{ reservationId: 22, restaurantId: 8 }],
        hasNext: false,
        totalCount: 2,
      })
    const { result } = renderHook(
      () => useVisitedReservationsInfiniteQuery(params, true),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    await act(() => result.current.fetchNextPage())

    expect(getVisitedReservations).toHaveBeenNthCalledWith(1, {
      ...params,
      cursor: undefined,
    })
    expect(getVisitedReservations).toHaveBeenNthCalledWith(2, {
      ...params,
      cursor: 23,
    })
  })
})
