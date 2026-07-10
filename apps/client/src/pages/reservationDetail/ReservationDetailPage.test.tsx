import '@testing-library/jest-dom/vitest'

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { DEFAULT_RESERVATION_STATUS } from '@/pages/myReservations/constants/reservationStatus'
import { ReservationDetailPage } from '@/pages/reservationDetail/ReservationDetailPage'
import { HASHI_KAKAO_CHANNEL_URL } from '@/shared/constants/contact'

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ reservationId: 'reservation-1' }),
  }
})

describe('ReservationDetailPage', () => {
  const mockOpen = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('open', mockOpen)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    mockNavigate.mockClear()
    mockOpen.mockClear()
  })

  it('opens the reservation cancel dialog from the fixed action bar', () => {
    render(<ReservationDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '예약 취소하기' }))

    const dialog = screen.getByRole('alertdialog')

    expect(
      within(dialog).getByText('정말 예약을 취소하시겠습니까?'),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText('동일한 예약은 다시 접수해야 합니다.'),
    ).toBeInTheDocument()
  })

  it('moves to the in-progress reservation list after confirming cancellation', () => {
    render(<ReservationDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '예약 취소하기' }))

    const dialog = screen.getByRole('alertdialog')
    fireEvent.click(within(dialog).getByRole('button', { name: '취소하기' }))

    expect(mockNavigate).toHaveBeenCalledWith(
      `${ROUTES.myReservations}?status=${DEFAULT_RESERVATION_STATUS}`,
    )
  })

  it('opens the Hashi Kakao contact link from the fixed action bar', () => {
    render(<ReservationDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '문의하기' }))

    expect(mockOpen).toHaveBeenCalledWith(
      HASHI_KAKAO_CHANNEL_URL,
      '_blank',
      'noreferrer',
    )
  })

  it('shows only the date for the received reservation step time', () => {
    render(<ReservationDetailPage />)

    expect(screen.getByText('6월 21일')).toBeInTheDocument()
    expect(screen.queryByText('6월 21일 13:44')).not.toBeInTheDocument()
  })

  it('renders only the contacting progress state in development mode', () => {
    vi.stubEnv('MODE', 'development')

    render(<ReservationDetailPage />)

    expect(screen.getAllByText('예약 접수')).toHaveLength(1)
    expect(screen.getByText('식당 컨택 중')).toBeInTheDocument()
    expect(screen.getAllByText('예약 확정')).toHaveLength(1)
  })
})
