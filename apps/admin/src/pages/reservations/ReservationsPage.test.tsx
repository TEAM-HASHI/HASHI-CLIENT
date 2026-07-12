import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ReservationsPage } from '@/pages/reservations/ReservationsPage'
import {
  useReservationUserQuery,
  useReservationsQuery,
  useUpdateReservationStatusMutation,
} from '@/shared/api/adminHooks'

vi.mock('@/shared/api/adminHooks', () => ({
  useReservationUserQuery: vi.fn(),
  useReservationsQuery: vi.fn(),
  useUpdateReservationStatusMutation: vi.fn(),
}))

const useReservationsQueryMock = vi.mocked(useReservationsQuery)
const useReservationUserQueryMock = vi.mocked(useReservationUserQuery)
const useUpdateReservationStatusMutationMock = vi.mocked(
  useUpdateReservationStatusMutation,
)
const mutateMock = vi.fn()

const reservation = {
  adultCount: 2,
  amount: 30_000,
  childCount: 1,
  confirmDDay: 3,
  id: 91,
  paymentStatus: 'PAID' as const,
  requestNote: '창가 자리 부탁드립니다.',
  reservationStatus: 'REQUESTED' as const,
  reservationType: 'STANDARD' as const,
  reservedAt: '2026-07-20T18:30:00',
  reserverName: '김하시',
  restaurantAddress: '도쿄도 시부야구',
  restaurantId: 7,
  restaurantImageUrl: '',
  restaurantName: '하시 스시',
  teenCount: 0,
  usedPoint: 1_000,
  userId: 3,
}

describe('ReservationsPage', () => {
  beforeEach(() => {
    mutateMock.mockReset()
    useReservationsQueryMock.mockReset()
    useReservationUserQueryMock.mockReset()
    useUpdateReservationStatusMutationMock.mockReset()

    useReservationsQueryMock.mockReturnValue({
      data: {
        page: 0,
        reservations: [reservation],
        size: 20,
        totalCount: 21,
        totalPages: 2,
      },
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useReservationsQuery>)
    useReservationUserQueryMock.mockReturnValue({
      data: {
        birthDate: '1999-01-01',
        email: 'hashi@example.com',
        nameEng: 'HASHI KIM',
        nickname: '하시',
        phone: '010-1234-5678',
        userId: 3,
      },
      isError: false,
      isLoading: false,
    } as ReturnType<typeof useReservationUserQuery>)
    useUpdateReservationStatusMutationMock.mockReturnValue({
      error: null,
      isError: false,
      isPending: false,
      mutate: mutateMock,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof useUpdateReservationStatusMutation>)
  })

  it('uses only server-supported filters and pagination', async () => {
    const user = userEvent.setup()
    render(<ReservationsPage />)

    expect(screen.getByText('하시 스시')).toBeInTheDocument()
    expect(screen.getByText('김하시')).toBeInTheDocument()
    expect(screen.queryByLabelText('Mock 상태')).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/검색/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('날짜')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '다음 페이지' }))

    expect(useReservationsQueryMock).toHaveBeenLastCalledWith({
      page: 1,
      size: 20,
    })
  })

  it('loads the selected reservation user in a drawer', async () => {
    const user = userEvent.setup()
    render(<ReservationsPage />)

    expect(useReservationUserQueryMock).toHaveBeenLastCalledWith(null)
    await user.click(screen.getByRole('button', { name: '예약자 보기' }))

    expect(useReservationUserQueryMock).toHaveBeenLastCalledWith(91)
    expect(
      screen.getByRole('dialog', { name: '예약자 정보' }),
    ).toHaveTextContent('hashi@example.com')
  })

  it('changes a reservation to a documented status', async () => {
    const user = userEvent.setup()
    render(<ReservationsPage />)

    await user.click(screen.getByRole('button', { name: '예약 상태 변경' }))
    await user.click(screen.getByRole('button', { name: /변경할 상태 요청됨/ }))
    await user.click(await screen.findByRole('option', { name: '예약 확정' }))
    await user.click(screen.getByRole('button', { name: '상태 변경' }))

    await waitFor(() =>
      expect(mutateMock).toHaveBeenCalledWith(
        { reservationId: 91, status: 'CONFIRMED' },
        expect.any(Object),
      ),
    )
  })
})
