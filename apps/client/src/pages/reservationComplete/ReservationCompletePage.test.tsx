import '@testing-library/jest-dom/vitest'

import { QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getReservationDetail } from '@/features/reservation/api/getReservationDetail'
import { ReservationCompletePage } from '@/pages/reservationComplete/ReservationCompletePage'
import { ApiError } from '@/shared/api/apiError'
import type { ErrorResponse } from '@/shared/api/types'
import { createQueryClient } from '@/shared/lib/queryClient'

const { mockNavigate, mockReservationParams } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockReservationParams: { reservationId: '12' } as { reservationId?: string },
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockReservationParams,
  }
})

vi.mock('@/features/reservation/api/getReservationDetail', () => ({
  getReservationDetail: vi.fn(),
}))

const mockedGetReservationDetail = vi.mocked(getReservationDetail)

const reservationDetailFixture = {
  reservationId: 12,
  reservationType: 'STANDARD',
  reserverName: '김하시',
  reservationStatus: 'REQUESTED',
  restaurantName: '도쿄 키츠라멘 본점',
  restaurantAddress: '도쿄 키츠라멘 본점도쿄',
  reservedAt: '2026-06-01T11:00:00',
  adultCount: 2,
  teenCount: 0,
  childCount: 0,
  receivedAt: '2026-05-20T10:00:00',
} as const

const notFoundResponse: ErrorResponse = {
  success: false,
  code: 'RESERVATION-001',
  message: '예약을 찾을 수 없습니다',
  data: null,
  timestamp: '2026-05-20T00:00:00.000Z',
  path: '/api/v1/reservations/12',
}

const renderReservationCompletePage = () => {
  const queryClient = createQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <ReservationCompletePage />
    </QueryClientProvider>,
  )
}

describe('ReservationCompletePage', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    mockNavigate.mockClear()
    mockReservationParams.reservationId = '12'
  })

  it('shows the completion message, progress steps, and receipt info from the reservation detail', async () => {
    mockedGetReservationDetail.mockResolvedValue(reservationDetailFixture)

    renderReservationCompletePage()

    expect(
      await screen.findByRole('heading', { name: '식당 예약 요청 완료!' }),
    ).toBeInTheDocument()
    expect(mockedGetReservationDetail).toHaveBeenCalledWith(12)

    const progress = screen.getByRole('list', { name: '예약 진행 단계' })
    const steps = within(progress).getAllByRole('listitem')

    expect(steps.map((step) => step.textContent)).toEqual([
      '예약 접수',
      'Hashi에서 검토',
      '예약 확정',
    ])
    expect(steps[1]).toHaveAttribute('aria-current', 'step')

    const receiptInfo = screen.getByRole('region', { name: '예약 접수 정보' })

    expect(within(receiptInfo).getByText('김하시')).toBeInTheDocument()
    expect(within(receiptInfo).getByText('어른 2명')).toBeInTheDocument()
    expect(
      within(receiptInfo).getByText('도쿄 키츠라멘 본점도쿄'),
    ).toBeInTheDocument()
    expect(within(receiptInfo).getByText('2026.6.1. 11:00')).toBeInTheDocument()
  })

  it('replaces the complete page with the reservation detail when confirm is pressed', async () => {
    mockedGetReservationDetail.mockResolvedValue(reservationDetailFixture)

    renderReservationCompletePage()

    fireEvent.click(await screen.findByRole('button', { name: '확인 완료' }))

    expect(mockNavigate).toHaveBeenCalledWith('/reservations/12', {
      replace: true,
      state: { fromReservationRequest: true },
    })
  })

  it('shows the not found page without fetching when the reservation id is invalid', () => {
    mockReservationParams.reservationId = 'abc'

    renderReservationCompletePage()

    expect(
      screen.getByRole('heading', { name: '404 페이지' }),
    ).toBeInTheDocument()
    expect(mockedGetReservationDetail).not.toHaveBeenCalled()
  })

  it('shows the reservation missing message when the reservation does not exist', async () => {
    mockedGetReservationDetail.mockRejectedValue(
      new ApiError(notFoundResponse, 404),
    )

    renderReservationCompletePage()

    expect(
      await screen.findByText('예약 정보를 찾을 수 없습니다.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '확인 완료' }),
    ).not.toBeInTheDocument()
  })

  it('shows the loading screen while the reservation detail is loading', () => {
    mockedGetReservationDetail.mockImplementation(
      () => new Promise(() => undefined),
    )

    renderReservationCompletePage()

    expect(screen.getByRole('status')).toHaveTextContent('로딩 중이에요')
  })
})
