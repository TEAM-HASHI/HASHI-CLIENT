import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUpdateReservationStatusMutation } from '@/shared/api/adminHooks'
import { adminQueryKeys } from '@/shared/api/queryKeys'
import { reservationApi } from '@/shared/api/reservationApi'

vi.mock('@/shared/api/reservationApi', () => ({
  reservationApi: {
    updateReservationStatus: vi.fn(),
  },
}))

const updateReservationStatusMock = vi.mocked(
  reservationApi.updateReservationStatus,
)

describe('admin API hooks', () => {
  beforeEach(() => {
    updateReservationStatusMock.mockReset()
    updateReservationStatusMock.mockResolvedValue({ reservationId: 3 })
  })

  it('invalidates reservation lists after a status change', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    })
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(useUpdateReservationStatusMutation, {
      wrapper,
    })

    act(() => {
      result.current.mutate({
        reservationId: 3,
        status: 'CONFIRMED',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(updateReservationStatusMock).toHaveBeenCalledWith(3, {
      status: 'CONFIRMED',
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: adminQueryKeys.reservations.lists(),
    })
  })
})
