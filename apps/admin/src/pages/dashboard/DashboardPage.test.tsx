import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { useReservationsQuery } from '@/shared/api/adminHooks'

vi.mock('@/shared/api/adminHooks', () => ({
  useReservationsQuery: vi.fn(),
}))

const useReservationsQueryMock = vi.mocked(useReservationsQuery)

describe('DashboardPage', () => {
  beforeEach(() => {
    useReservationsQueryMock.mockImplementation(
      (params) =>
        ({
          data: {
            page: 0,
            reservations:
              params.size === 5
                ? [
                    {
                      adultCount: 2,
                      amount: 10000,
                      childCount: 0,
                      confirmDDay: 2,
                      id: 7,
                      paymentStatus: 'PAID',
                      requestNote: '',
                      reservationStatus: 'REQUESTED',
                      reservationType: 'STANDARD',
                      reservedAt: '2026-07-12T18:00:00',
                      reserverName: '해시',
                      restaurantAddress: '도쿄',
                      restaurantId: 2,
                      restaurantImageUrl: '',
                      restaurantName: '하시 스시',
                      teenCount: 0,
                      usedPoint: 0,
                      userId: 3,
                    },
                  ]
                : [],
            size: params.size ?? 20,
            totalCount: params.status === 'REQUESTED' ? 4 : 12,
            totalPages: 1,
          },
          isError: false,
          isLoading: false,
          refetch: vi.fn(),
        }) as unknown as ReturnType<typeof useReservationsQuery>,
    )
  })

  it('renders reservation metrics and recent reservations only', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('전체 예약')).toBeInTheDocument()
    expect(screen.getAllByText('요청됨')).not.toHaveLength(0)
    expect(screen.getByText('연락 중')).toBeInTheDocument()
    expect(screen.getByText('예약 확정')).toBeInTheDocument()
    expect(screen.getByText('하시 스시')).toBeInTheDocument()
    expect(screen.queryByText('총 식당 수')).not.toBeInTheDocument()
    expect(screen.queryByText('최근 수정 식당')).not.toBeInTheDocument()
  })
})
