import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'

import { RestaurantReservationNewPage } from '@/pages/restaurantReservationNew/RestaurantReservationNewPage'

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ restaurantId: 'default' }),
  }
})

describe('RestaurantReservationNewPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 1, 9))
  })

  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
    vi.useRealTimers()
  })

  it('keeps the reservation CTA disabled before required values are selected', () => {
    render(<RestaurantReservationNewPage />)

    expect(screen.getByRole('button', { name: '예약하기' })).toBeDisabled()
  })

  it('enables submit after required values are selected and navigates with reservation state', () => {
    render(<RestaurantReservationNewPage />)

    fireEvent.change(
      screen.getByPlaceholderText('예약자 성함을 입력해주세요.'),
      {
        target: { value: '김하시' },
      },
    )
    fireEvent.click(screen.getByRole('button', { name: '어른 인원 늘리기' }))
    fireEvent.click(screen.getByRole('button', { name: '어른 인원 늘리기' }))
    fireEvent.click(screen.getByRole('button', { name: '2026년 6월 2일' }))
    fireEvent.click(screen.getByRole('button', { name: '11:00' }))

    const submitButton = screen.getByRole('button', { name: '예약하기' })

    expect(submitButton).toBeEnabled()

    fireEvent.click(submitButton)

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.reservationRequest, {
      state: {
        restaurantId: 'default',
        restaurantName: '야키니쿠 리키마루 이케부쿠로 히가시구치 텐',
        guestName: '김하시',
        guests: {
          adult: 2,
          teen: 0,
          child: 0,
        },
        date: '2026-06-02',
        time: '11:00',
        requestNote: '',
      },
    })
  })

  it('disables today and previous dates', () => {
    vi.setSystemTime(new Date(2026, 5, 15, 9))

    render(<RestaurantReservationNewPage />)

    expect(
      screen.getByRole('button', { name: '2026년 6월 14일' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: '2026년 6월 15일' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: '2026년 6월 16일' }),
    ).toBeEnabled()
  })

  it('moves back to the previous history entry from the header action', () => {
    render(<RestaurantReservationNewPage />)

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
