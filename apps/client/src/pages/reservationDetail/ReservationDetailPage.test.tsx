import '@testing-library/jest-dom/vitest'

import { QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { DEFAULT_RESERVATION_STATUS } from '@/pages/myReservations/constants/reservationStatus'
import { cancelReservation } from '@/pages/reservationDetail/api/cancelReservation'
import { getReservationDetail } from '@/pages/reservationDetail/api/getReservationDetail'
import { ReservationDetailPage } from '@/pages/reservationDetail/ReservationDetailPage'
import { ApiError } from '@/shared/api'
import type { ErrorResponse } from '@/shared/api'
import { createQueryClient } from '@/shared/lib/queryClient'

const { mockNavigate, mockReservationParams, mockShowToast } = vi.hoisted(
  () => ({
    mockNavigate: vi.fn(),
    mockReservationParams: { reservationId: '12' },
    mockShowToast: vi.fn(),
  }),
)

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockReservationParams,
  }
})

vi.mock('@/pages/reservationDetail/api/getReservationDetail', () => ({
  getReservationDetail: vi.fn(),
}))

vi.mock('@/pages/reservationDetail/api/cancelReservation', () => ({
  cancelReservation: vi.fn(),
}))

vi.mock('@hashi/hds-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hashi/hds-ui')>()

  return {
    ...actual,
    showToast: mockShowToast,
  }
})

const mockedGetReservationDetail = vi.mocked(getReservationDetail)
const mockedCancelReservation = vi.mocked(cancelReservation)

const reservationDetailFixture = {
  reservationId: 12,
  reservationType: 'STANDARD',
  reserverName: '이하시',
  reservationStatus: 'CONTACTING',
  restaurantId: 34,
  restaurantName: '스시 하시 긴자점',
  restaurantNameJa: '寿司ハシ 銀座店',
  restaurantAddress: '도쿄도 주오구 긴자 1-1-1',
  restaurantImageUrl: 'https://example.com/sushi.jpg',
  reservedAt: '2026-07-20T18:30:00',
  adultCount: 2,
  teenCount: 1,
  childCount: 0,
  requestNote: '창가 자리로 부탁드립니다.',
  receivedAt: '2026-07-12T13:44:00',
  confirmExpectedAt: '2026-07-14T13:44:00',
} as const

const notFoundResponse: ErrorResponse = {
  success: false,
  code: 'RESERVATION-001',
  message: '예약을 찾을 수 없습니다',
  data: null,
  timestamp: '2026-07-13T00:00:00.000Z',
  path: '/api/v1/reservations/12',
}

const alreadyCanceledResponse: ErrorResponse = {
  success: false,
  code: 'RESERVATION-004',
  message: '이미 취소된 예약입니다',
  data: null,
  timestamp: '2026-07-13T00:00:00.000Z',
  path: '/api/v1/reservations/12/cancel',
}

const renderReservationDetailPage = () => {
  const queryClient = createQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <ReservationDetailPage />
    </QueryClientProvider>,
  )
}

describe('ReservationDetailPage', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    mockNavigate.mockClear()
    mockShowToast.mockClear()
  })

  beforeEach(() => {
    mockReservationParams.reservationId = '12'
    mockedGetReservationDetail.mockResolvedValue(reservationDetailFixture)
    mockedCancelReservation.mockResolvedValue({
      message: '예약 취소 요청이 완료되었습니다',
      reservation: {
        ...reservationDetailFixture,
        reservationStatus: 'CANCELED',
      },
    })
  })

  it('renders reservation detail from API data', async () => {
    renderReservationDetailPage()

    expect(mockedGetReservationDetail).toHaveBeenCalledWith(12)
    expect(await screen.findByText('스시 하시 긴자점')).toBeInTheDocument()
    expect(screen.getByText('寿司ハシ 銀座店')).toBeInTheDocument()
    expect(screen.getByText('2026.7.12')).toBeInTheDocument()
    expect(screen.getByText('이하시')).toBeInTheDocument()
    expect(screen.getByText('어른 2명, 청소년 1명')).toBeInTheDocument()
    expect(screen.getByText('도쿄도 주오구 긴자 1-1-1')).toBeInTheDocument()
    expect(screen.getByText('2026.7.20. 18:30')).toBeInTheDocument()
    expect(screen.getByText('예정 7월 14일')).toBeInTheDocument()
  })

  it('renders not found page without requesting API when reservation id is invalid', async () => {
    mockReservationParams.reservationId = 'invalid-id'

    renderReservationDetailPage()

    expect(
      await screen.findByRole('heading', { name: '404 페이지' }),
    ).toBeInTheDocument()
    expect(mockedGetReservationDetail).not.toHaveBeenCalled()
  })

  it('renders not found page when reservation detail API responds with 404', async () => {
    mockedGetReservationDetail.mockRejectedValue(
      new ApiError(notFoundResponse, 404),
    )

    renderReservationDetailPage()

    expect(
      await screen.findByRole('heading', { name: '404 페이지' }),
    ).toBeInTheDocument()
  })

  it('renders not found page when reservation status is canceled', async () => {
    mockedGetReservationDetail.mockResolvedValue({
      ...reservationDetailFixture,
      reservationStatus: 'CANCELED',
    })

    renderReservationDetailPage()

    expect(
      await screen.findByRole('heading', { name: '404 페이지' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('스시 하시 긴자점')).not.toBeInTheDocument()
  })

  it('opens the reservation cancel dialog from the fixed action bar', async () => {
    renderReservationDetailPage()

    fireEvent.click(
      await screen.findByRole('button', { name: '예약 취소하기' }),
    )

    const dialog = screen.getByRole('alertdialog')

    expect(
      within(dialog).getByText('정말 예약을 취소하시겠습니까?'),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText('동일한 예약은 다시 접수해야 합니다.'),
    ).toBeInTheDocument()
  })

  it('cancels the reservation and moves to the in-progress reservation list after confirming cancellation', async () => {
    renderReservationDetailPage()

    fireEvent.click(
      await screen.findByRole('button', { name: '예약 취소하기' }),
    )

    const dialog = screen.getByRole('alertdialog')
    fireEvent.click(within(dialog).getByRole('button', { name: '취소하기' }))

    await waitFor(() => {
      expect(mockedCancelReservation).toHaveBeenCalledWith(12)
      expect(mockShowToast).toHaveBeenCalledWith({
        children: '예약 취소 요청이 완료되었습니다',
      })
      expect(mockNavigate).toHaveBeenCalledWith(
        `${ROUTES.myReservations}?status=${DEFAULT_RESERVATION_STATUS}`,
      )
    })
  })

  it('shows an error toast and stays on the page when reservation cancellation fails', async () => {
    mockedCancelReservation.mockRejectedValue(
      new ApiError(alreadyCanceledResponse, 409),
    )

    renderReservationDetailPage()

    fireEvent.click(
      await screen.findByRole('button', { name: '예약 취소하기' }),
    )

    const dialog = screen.getByRole('alertdialog')
    fireEvent.click(within(dialog).getByRole('button', { name: '취소하기' }))

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith({
        children: '이미 취소된 예약입니다',
      })
    })
    expect(mockNavigate).not.toHaveBeenCalledWith(
      `${ROUTES.myReservations}?status=${DEFAULT_RESERVATION_STATUS}`,
    )
  })

  it('disables the confirm cancel button while reservation cancellation is pending', async () => {
    let resolveCancelReservation: (
      value: Awaited<ReturnType<typeof cancelReservation>>,
    ) => void = () => {}

    mockedCancelReservation.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCancelReservation = resolve
        }),
    )

    renderReservationDetailPage()

    fireEvent.click(
      await screen.findByRole('button', { name: '예약 취소하기' }),
    )

    const dialog = screen.getByRole('alertdialog')
    const confirmCancelButton = within(dialog).getByRole('button', {
      name: '취소하기',
    })
    const closeButton = within(dialog).getByRole('button', { name: '닫기' })

    fireEvent.click(confirmCancelButton)

    await waitFor(() => {
      expect(confirmCancelButton).toBeDisabled()
      expect(closeButton).toBeDisabled()
    })

    fireEvent.click(confirmCancelButton)
    fireEvent.click(closeButton)
    expect(mockedCancelReservation).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()

    resolveCancelReservation({
      message: '예약 취소 요청이 완료되었습니다',
      reservation: {
        ...reservationDetailFixture,
        reservationStatus: 'CANCELED',
      },
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `${ROUTES.myReservations}?status=${DEFAULT_RESERVATION_STATUS}`,
      )
    })
  })

  it('moves to home from the fixed action bar', async () => {
    renderReservationDetailPage()

    fireEvent.click(
      await screen.findByRole('button', { name: '홈으로 돌아가기' }),
    )

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.home)
  })

  it('shows only the date for the received reservation step time', async () => {
    renderReservationDetailPage()

    expect(await screen.findByText('7월 12일')).toBeInTheDocument()
    expect(screen.queryByText('7월 12일 13:44')).not.toBeInTheDocument()
  })

  it('renders only the contacting progress state in development mode', async () => {
    vi.stubEnv('MODE', 'development')

    renderReservationDetailPage()

    expect(await screen.findByText('식당 컨택 중')).toBeInTheDocument()
    expect(screen.getAllByText('예약 접수')).toHaveLength(1)
    expect(screen.getByText('식당 컨택 중')).toBeInTheDocument()
    expect(screen.getAllByText('예약 확정')).toHaveLength(1)
  })
})
