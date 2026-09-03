import '@testing-library/jest-dom/vitest'

import { showToast } from '@hashi/hds-ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { cancelReservation } from '@/features/reservation/api/cancelReservation'
import { getMyReservations } from '@/features/reservation/api/getMyReservations'
import type {
  ReservationListResponse,
  ReservationResponse,
} from '@/features/reservation/api/getMyReservations'
import { useCancelReservationMutation } from '@/features/reservation/hooks/useCancelReservationMutation'
import { myReservationsQueryKeys } from '@/features/reservation/queries/myReservationsQueryKeys'

vi.mock('@/features/reservation/api/cancelReservation', () => ({
  cancelReservation: vi.fn(),
}))

vi.mock('@/features/reservation/api/getMyReservations', () => ({
  getMyReservations: vi.fn(),
}))

vi.mock('@hashi/hds-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hashi/hds-ui')>()

  return {
    ...actual,
    showToast: vi.fn(),
  }
})

const mockedCancelReservation = vi.mocked(cancelReservation)
const mockedGetMyReservations = vi.mocked(getMyReservations)
const mockedShowToast = vi.mocked(showToast)

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
      mutations: { retry: false },
      queries: { retry: false },
    },
  })

describe('useCancelReservationMutation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('runs page-local preparation before shared cache synchronization and success toast', async () => {
    const queryClient = createQueryClient()
    const events: string[] = []
    const onCanceled = vi.fn(() => {
      events.push('page')
    })
    const upcomingQueryKey = myReservationsQueryKeys.infiniteList('UPCOMING')

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
    mockedCancelReservation.mockResolvedValue({
      message: '예약 취소 요청이 완료되었습니다',
      reservation: canceledReservation,
    })
    mockedGetMyReservations.mockImplementation(async () => {
      events.push('sync')

      return {
        reservations: [],
        hasNext: false,
        totalCount: 0,
      } satisfies ReservationListResponse
    })
    mockedShowToast.mockImplementation(() => {
      events.push('toast')

      return 'toast-id'
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(
      () => useCancelReservationMutation({ onCanceled }),
      { wrapper },
    )

    await act(async () => {
      await result.current.mutateAsync(21)
    })

    expect(events).toEqual(['page', 'sync', 'toast'])
    expect(onCanceled).toHaveBeenCalledWith({
      message: '예약 취소 요청이 완료되었습니다',
      reservation: canceledReservation,
    })
    expect(queryClient.getQueryData(upcomingQueryKey)).toMatchObject({
      pages: [{ reservations: [], totalCount: 0 }],
    })
    expect(mockedShowToast).toHaveBeenCalledWith({
      children: '예약 취소 요청이 완료되었습니다',
    })
  })

  it('keeps the shared success flow when page-local preparation fails', async () => {
    const queryClient = createQueryClient()
    const onCanceled = vi
      .fn()
      .mockRejectedValue(new Error('detail cache update failed'))
    const cancelResult = {
      message: '예약 취소 요청이 완료되었습니다',
      reservation: canceledReservation,
    }

    mockedCancelReservation.mockResolvedValue(cancelResult)
    mockedGetMyReservations.mockResolvedValue({
      reservations: [],
      hasNext: false,
      totalCount: 0,
    } satisfies ReservationListResponse)

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(
      () => useCancelReservationMutation({ onCanceled }),
      { wrapper },
    )

    await act(async () => {
      await expect(result.current.mutateAsync(21)).resolves.toEqual(
        cancelResult,
      )
    })

    expect(
      queryClient.getQueryData(
        myReservationsQueryKeys.infiniteList('CANCELED'),
      ),
    ).toMatchObject({
      pages: [
        {
          reservations: [
            expect.objectContaining({
              reservationId: 21,
              reservationStatus: 'CANCELED',
            }),
          ],
        },
      ],
    })
    expect(mockedShowToast).toHaveBeenCalledWith({
      children: '예약 취소 요청이 완료되었습니다',
    })
  })
})
