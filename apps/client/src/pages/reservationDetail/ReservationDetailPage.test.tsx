import '@testing-library/jest-dom/vitest'

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

  it('opens the Hashi Kakao contact link from the fixed action bar', () => {
    render(<ReservationDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '문의하기' }))

    expect(mockOpen).toHaveBeenCalledWith(
      HASHI_KAKAO_CHANNEL_URL,
      '_blank',
      'noreferrer',
    )
  })
})
