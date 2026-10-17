import { showToast } from '@hashi/hds-ui'
import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { pointQueryKeys } from '@/features/point/queries/pointQueryKeys'
import { myReservationsQueryKeys } from '@/features/reservation'
import { createReservation } from '@/pages/reservationRequest/api/createReservation'
import { useCreateReservationMutation } from '@/pages/reservationRequest/hooks/useCreateReservationMutation'
import { createQueryClient } from '@/shared/lib/queryClient'
import { captureError } from '@/shared/lib/sentry'

vi.mock('@hashi/hds-ui', async () => ({
  ...(await vi.importActual<typeof import('@hashi/hds-ui')>('@hashi/hds-ui')),
  showToast: vi.fn(),
}))
vi.mock('@/shared/lib/sentry', () => ({ captureError: vi.fn() }))

vi.mock('@/pages/reservationRequest/api/createReservation', () => ({
  createReservation: vi.fn(),
}))

const mockedCreateReservation = vi.mocked(createReservation)

const createReservationParams = {
  draft: {
    source: 'restaurant' as const,
    restaurantId: '10',
    restaurantName: '하시 스시',
    restaurantAddress: '도쿄도 주오구 긴자 1-1',
    restaurantImageUrl: 'https://example.com/restaurant.webp',
    reservationFee: 4_000,
    guestName: '김하시',
    guests: { adult: 2, teen: 0, child: 0 },
    date: '2026-08-01',
    time: '19:00',
    requestNote: '',
  },
  usedPoint: 1_000,
}

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return Wrapper
}

describe('useCreateReservationMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedCreateReservation.mockReset()
  })

  it('invalidates the point balance after a reservation is created', async () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    mockedCreateReservation.mockResolvedValue({ reservationId: 31 })
    const { result } = renderHook(() => useCreateReservationMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync(createReservationParams)
    })

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: pointQueryKeys.myBalance(),
    })
  })

  it('invalidates my reservation lists after a reservation is created', async () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    mockedCreateReservation.mockResolvedValue({ reservationId: 31 })
    const { result } = renderHook(() => useCreateReservationMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync(createReservationParams)
    })

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: myReservationsQueryKeys.all,
    })
  })

  it('keeps the point balance cache when reservation creation fails', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    })
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    mockedCreateReservation.mockRejectedValue(new Error('request failed'))
    const { result } = renderHook(() => useCreateReservationMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      await expect(
        result.current.mutateAsync(createReservationParams),
      ).rejects.toThrow('request failed')
    })

    expect(invalidateQueries).not.toHaveBeenCalled()
  })
  it.each(['request failed', '예약 생성 응답에 예약 ID가 없습니다.'])(
    'shows the reservation error once and records %s',
    async (message) => {
      const queryClient = createQueryClient()
      const error = new Error(message)
      mockedCreateReservation.mockRejectedValue(error)
      const { result } = renderHook(() => useCreateReservationMutation(), {
        wrapper: createWrapper(queryClient),
      })
      await act(async () => {
        await expect(
          result.current.mutateAsync(createReservationParams),
        ).rejects.toThrow(message)
      })
      expect(showToast).toHaveBeenCalledExactlyOnceWith({
        children: '예약 요청 중 문제가 발생했어요. 다시 시도해주세요.',
      })
      expect(captureError).toHaveBeenCalledExactlyOnceWith(error)
    },
  )
})
