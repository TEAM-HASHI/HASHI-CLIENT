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
  teenCount: 1,
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

  it('keeps reservation actions on a single line', () => {
    render(<ReservationsPage />)

    const userButton = screen.getByRole('button', { name: '예약자 보기' })
    const statusButton = screen.getByRole('button', {
      name: '예약 상태 변경',
    })

    expect(userButton).toHaveClass('shrink-0', 'whitespace-nowrap')
    expect(statusButton).toHaveClass('shrink-0', 'whitespace-nowrap')
    expect(userButton.parentElement).toHaveClass('min-w-max', 'flex-nowrap')
  })

  it('keeps payment and reservation status chips on a single line', () => {
    render(<ReservationsPage />)

    expect(screen.getByText('결제완료')).toHaveClass(
      'shrink-0',
      'whitespace-nowrap',
    )
    expect(screen.getByText('요청됨')).toHaveClass(
      'shrink-0',
      'whitespace-nowrap',
    )
  })

  it('warns on active reservations for the same restaurant in the same minute', () => {
    useReservationsQueryMock.mockReturnValue({
      data: {
        page: 0,
        reservations: [
          reservation,
          {
            ...reservation,
            id: 92,
            reservationStatus: 'CONFIRMED',
            reservedAt: '2026-07-20T18:30:59',
            reserverName: '이하시',
          },
          {
            ...reservation,
            id: 93,
            reservationStatus: 'CANCELED',
            reserverName: '박취소',
          },
          {
            ...reservation,
            id: 94,
            reserverName: '최다른식당',
            restaurantId: 8,
          },
          {
            ...reservation,
            id: 95,
            reservedAt: '2026-07-20T18:31:00',
            reserverName: '정다른시간',
          },
        ],
        size: 20,
        totalCount: 5,
        totalPages: 1,
      },
      isError: false,
      isFetching: false,
      isLoading: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useReservationsQuery>)

    render(<ReservationsPage />)

    expect(screen.getAllByText('동일 시간 2건')).toHaveLength(2)
    expect(screen.getByText('김하시').closest('tr')).toHaveClass('bg-red-50')
    expect(screen.getByText('이하시').closest('tr')).toHaveClass('bg-red-50')
    expect(screen.getByText('박취소').closest('tr')).not.toHaveClass(
      'bg-red-50',
    )
    expect(screen.getByText('최다른식당').closest('tr')).not.toHaveClass(
      'bg-red-50',
    )
    expect(screen.getByText('정다른시간').closest('tr')).not.toHaveClass(
      'bg-red-50',
    )
  })

  it('wraps guest categories only between complete labels', () => {
    render(<ReservationsPage />)

    const adultCount = screen.getByText('성인 2,')
    const teenCount = screen.getByText('청소년 1,')
    const childCount = screen.getByText('어린이 1')

    expect(adultCount).toHaveClass('whitespace-nowrap')
    expect(teenCount).toHaveClass('whitespace-nowrap')
    expect(childCount).toHaveClass('whitespace-nowrap')
    expect(adultCount.parentElement).toHaveClass('flex-wrap')
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
