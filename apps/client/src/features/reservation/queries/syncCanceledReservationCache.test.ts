import { QueryClient, type InfiniteData } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getMyReservations } from '@/features/reservation/api/getMyReservations'
import type {
  ReservationListResponse,
  ReservationResponse,
} from '@/features/reservation/api/getMyReservations'
import { myReservationsQueryKeys } from '@/features/reservation/queries/myReservationsQueryKeys'
import { syncCanceledReservationCache } from '@/features/reservation/queries/syncCanceledReservationCache'

vi.mock('@/features/reservation/api/getMyReservations', () => ({
  getMyReservations: vi.fn(),
}))

const mockedGetMyReservations = vi.mocked(getMyReservations)

const canceledReservation = {
  reservationId: 21,
  restaurantId: 34,
  restaurantName: '스시 하시',
  reservedAt: '2026-07-20T18:30:00',
  adultCount: 2,
  reservationStatus: 'CANCELED',
} as ReservationResponse

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

describe('syncCanceledReservationCache', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('moves a canceled reservation from the upcoming cache to the canceled cache', async () => {
    const queryClient = createQueryClient()
    const upcomingQueryKey = myReservationsQueryKeys.infiniteList('UPCOMING')
    const canceledQueryKey = myReservationsQueryKeys.infiniteList('CANCELED')

    queryClient.setQueryData(upcomingQueryKey, {
      pages: [
        {
          reservations: [
            {
              ...canceledReservation,
              reservationStatus: 'CONFIRMED',
            },
          ],
          hasNext: false,
          totalCount: 1,
        },
      ],
      pageParams: [null],
    })
    mockedGetMyReservations.mockResolvedValue({
      reservations: [],
      hasNext: false,
      totalCount: 0,
    } satisfies ReservationListResponse)

    await syncCanceledReservationCache(queryClient, canceledReservation)

    expect(queryClient.getQueryData(upcomingQueryKey)).toMatchObject({
      pages: [{ reservations: [], totalCount: 0 }],
    })
    expect(queryClient.getQueryData(canceledQueryKey)).toMatchObject({
      pages: [
        {
          reservations: [
            expect.objectContaining({
              reservationId: 21,
              reservationStatus: 'CANCELED',
            }),
          ],
          totalCount: 1,
        },
      ],
    })
  })

  it('keeps local cache correction when fetching the canceled list fails', async () => {
    const queryClient = createQueryClient()
    const upcomingQueryKey = myReservationsQueryKeys.infiniteList('UPCOMING')
    const canceledQueryKey = myReservationsQueryKeys.infiniteList('CANCELED')

    queryClient.setQueryData(upcomingQueryKey, {
      pages: [
        {
          reservations: [
            {
              ...canceledReservation,
              reservationStatus: 'CONFIRMED',
            },
          ],
          hasNext: false,
          totalCount: 1,
        },
      ],
      pageParams: [null],
    })
    mockedGetMyReservations.mockRejectedValue(new Error('canceled list failed'))

    await expect(
      syncCanceledReservationCache(queryClient, canceledReservation),
    ).resolves.toBeUndefined()

    expect(queryClient.getQueryData(upcomingQueryKey)).toMatchObject({
      pages: [{ reservations: [], totalCount: 0 }],
    })
    expect(queryClient.getQueryData(canceledQueryKey)).toMatchObject({
      pages: [
        {
          reservations: [expect.objectContaining({ reservationId: 21 })],
          totalCount: 1,
        },
      ],
    })
  })

  it('does not add the same reservation to the canceled cache twice', async () => {
    const queryClient = createQueryClient()
    const canceledQueryKey = myReservationsQueryKeys.infiniteList('CANCELED')
    const canceledPage = {
      reservations: [canceledReservation],
      hasNext: false,
      totalCount: 1,
    } satisfies ReservationListResponse

    queryClient.setQueryData(canceledQueryKey, {
      pages: [canceledPage],
      pageParams: [null],
    })
    mockedGetMyReservations.mockResolvedValue(canceledPage)

    await syncCanceledReservationCache(queryClient, canceledReservation)

    const queryData =
      queryClient.getQueryData<InfiniteData<ReservationListResponse>>(
        canceledQueryKey,
      )

    expect(queryData?.pages[0]?.reservations).toHaveLength(1)
    expect(queryData?.pages[0]?.reservations).toEqual([
      expect.objectContaining({ reservationId: 21 }),
    ])
  })
})
