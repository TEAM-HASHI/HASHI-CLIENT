import '@testing-library/jest-dom/vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { pointQueryKeys } from '@/features/point/queries/pointQueryKeys'
import { createReservation } from '@/pages/reservationRequest/api/createReservation'
import { ReservationRequestPage } from '@/pages/reservationRequest/ReservationRequestPage'

const { mockLocationState, mockNavigate } = vi.hoisted(() => ({
  mockLocationState: {
    current: undefined as unknown,
  },
  mockNavigate: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useLocation: () => ({ state: mockLocationState.current }),
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/pages/reservationRequest/api/createReservation', () => ({
  createReservation: vi.fn(),
}))

vi.mock('@/features/point/api/getMyPointBalance', () => ({
  getMyPointBalance: vi.fn().mockResolvedValue({ availablePoint: 7_000 }),
}))

const mockedCreateReservation = vi.mocked(createReservation)

const reservationDraft = {
  restaurantId: '10',
  restaurantName: '야키니쿠 리키마루 이케부쿠로 히가시구치 텐',
  restaurantAddress: '도쿄도 주오구 긴자 1-1',
  restaurantImageUrl: 'https://example.com/restaurant.webp',
  reservationFee: 5_000,
  guestName: '김하시',
  guests: {
    adult: 2,
    teen: 0,
    child: 0,
  },
  date: '2026-06-01',
  time: '11:00',
  requestNote: '',
}

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
    },
  })

  queryClient.setQueryData(pointQueryKeys.myBalance(), {
    availablePoint: 7_000,
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ReservationRequestPage />
    </QueryClientProvider>,
  )
}

describe('ReservationRequestPage', () => {
  beforeEach(() => {
    mockLocationState.current = reservationDraft
    mockedCreateReservation.mockReset()
    mockedCreateReservation.mockResolvedValue({ reservationId: 31 })
  })

  afterEach(() => {
    cleanup()
    mockLocationState.current = undefined
    mockNavigate.mockClear()
  })

  it('renders reservation request information from location state', () => {
    renderPage()

    expect(screen.getByText('예약하기')).toBeInTheDocument()
    expect(
      screen.getByText('야키니쿠 리키마루 이케부쿠로 히가시구치 텐'),
    ).toBeInTheDocument()
    expect(screen.getByText('김하시')).toBeInTheDocument()
    expect(screen.getByText('어른 2명')).toBeInTheDocument()
    expect(screen.getByText('도쿄도 주오구 긴자 1-1')).toBeInTheDocument()
    expect(screen.getByText('2026.6.1. 11:00')).toBeInTheDocument()
    expect(screen.getByText('5000원')).toBeInTheDocument()
    expect(screen.getByText('7,000원')).toBeInTheDocument()
  })

  it('returns home when reservation draft state is missing', async () => {
    mockLocationState.current = undefined

    renderPage()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.home, { replace: true })
    })
    expect(screen.queryByText('예약하기')).not.toBeInTheDocument()
  })

  it('renders anywhere reservation state with user input and placeholder image', () => {
    mockLocationState.current = {
      source: 'anywhere',
      restaurantId: null,
      restaurantName: '키츠라멘',
      restaurantAddress: '도쿄 키츠라멘 본점',
      restaurantImageUrl: null,
      guestName: '김하시',
      guests: {
        adult: 1,
        teen: 0,
        child: 0,
      },
      date: '2026-06-02',
      time: '11:30',
      requestNote: '',
    }

    renderPage()

    expect(screen.getByText('키츠라멘')).toBeInTheDocument()
    expect(screen.getByText('도쿄 키츠라멘 본점')).toBeInTheDocument()
    expect(
      screen.queryByText('도쿄 키츠라멘 본점도쿄 키츠라멘 본점'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: '어디든 예약 식당 기본 이미지' }),
    ).toBeInTheDocument()
    expect(screen.getByText('어른 1명')).toBeInTheDocument()
    expect(screen.getByText('2026.6.2. 11:30')).toBeInTheDocument()
  })

  it('normalizes point input and clamps it to the maximum usable point', () => {
    renderPage()

    const pointInput = screen.getByLabelText('사용 포인트')

    fireEvent.change(pointInput, {
      target: { value: 'abc9000원' },
    })

    expect(pointInput).toHaveValue('5000원')
    expect(screen.getByText('2,000원')).toBeInTheDocument()
    expect(screen.getByText('0원')).toBeInTheDocument()
  })

  it('uses all usable points when use-all button is clicked', () => {
    renderPage()

    const useAllPointsButton = screen.getByRole('button', {
      name: '전액사용',
    })

    expect(useAllPointsButton).toHaveClass('typo-body-6')

    fireEvent.click(useAllPointsButton)

    expect(screen.getByLabelText('사용 포인트')).toHaveValue('5000원')
    expect(screen.getByText('2,000원')).toBeInTheDocument()
    expect(screen.getByText('0원')).toBeInTheDocument()
  })

  it('opens and closes the reservation confirm dialog', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '예약 요청' }))

    const dialog = screen.getByRole('alertdialog', {
      name: '예약을 진행할까요?',
    })

    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText('5,000원')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: '취소' })).toHaveClass(
      'typo-sub-header-2',
    )
    expect(within(dialog).getByRole('button', { name: '예약' })).toHaveClass(
      'typo-sub-header-2',
    )

    fireEvent.click(within(dialog).getByRole('button', { name: '취소' }))

    expect(
      screen.queryByRole('alertdialog', { name: '예약을 진행할까요?' }),
    ).not.toBeInTheDocument()
  })

  it('creates the reservation and navigates with the response reservation id', async () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '예약 요청' }))

    const dialog = screen.getByRole('alertdialog', {
      name: '예약을 진행할까요?',
    })

    fireEvent.click(within(dialog).getByRole('button', { name: '예약' }))

    await waitFor(() => {
      expect(mockedCreateReservation.mock.calls[0]?.[0]).toEqual({
        draft: reservationDraft,
        usedPoint: 0,
      })
      expect(mockNavigate).toHaveBeenCalledWith('/reservations/31')
    })
  })

  it('keeps the confirm dialog open when reservation creation fails', async () => {
    mockedCreateReservation.mockRejectedValue(new Error('request failed'))
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '예약 요청' }))

    const dialog = screen.getByRole('alertdialog', {
      name: '예약을 진행할까요?',
    })
    fireEvent.click(within(dialog).getByRole('button', { name: '예약' }))

    await waitFor(() => {
      expect(mockedCreateReservation).toHaveBeenCalledTimes(1)
    })
    expect(dialog).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('prevents duplicate requests from immediate repeated confirmation', async () => {
    mockedCreateReservation.mockImplementation(
      () => new Promise(() => undefined),
    )
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '예약 요청' }))

    const confirmButton = within(
      screen.getByRole('alertdialog', { name: '예약을 진행할까요?' }),
    ).getByRole('button', { name: '예약' })
    fireEvent.click(confirmButton)
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockedCreateReservation).toHaveBeenCalledTimes(1)
    })
  })

  it('keeps the confirm dialog locked while reservation creation is pending', async () => {
    mockedCreateReservation.mockImplementation(
      () => new Promise(() => undefined),
    )
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '예약 요청' }))

    const dialog = screen.getByRole('alertdialog', {
      name: '예약을 진행할까요?',
    })
    const confirmButton = within(dialog).getByRole('button', { name: '예약' })
    const cancelButton = within(dialog).getByRole('button', { name: '취소' })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(confirmButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(dialog).toBeInTheDocument()
  })

  it('moves back to the previous history entry from the header action', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
