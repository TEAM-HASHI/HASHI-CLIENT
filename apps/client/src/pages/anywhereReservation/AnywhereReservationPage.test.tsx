import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'

import { AnywhereReservationPage } from '@/pages/anywhereReservation/AnywhereReservationPage'

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('AnywhereReservationPage', () => {
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
    render(<AnywhereReservationPage />)

    expect(screen.getByRole('heading', { name: '2026 6월' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '예약하기' })).toBeDisabled()
  })

  it('enables submit after required values are selected and navigates with anywhere reservation state', () => {
    render(<AnywhereReservationPage />)

    fireEvent.change(screen.getByPlaceholderText('식당명을 입력해주세요.'), {
      target: { value: '키츠라멘' },
    })
    fireEvent.change(screen.getByPlaceholderText('식당 주소를 입력해주세요.'), {
      target: { value: '도쿄 키츠라멘 본점' },
    })
    fireEvent.change(
      screen.getByPlaceholderText('예약자 성함을 입력해주세요.'),
      {
        target: { value: '김하시' },
      },
    )
    fireEvent.click(screen.getByRole('button', { name: '어른 인원 늘리기' }))
    fireEvent.click(screen.getByRole('button', { name: '2026년 6월 2일' }))
    fireEvent.click(screen.getByRole('button', { name: '11:30' }))

    const submitButton = screen.getByRole('button', { name: '예약하기' })

    expect(submitButton).toBeEnabled()

    fireEvent.click(submitButton)

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.reservationRequest, {
      state: {
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
      },
    })
  })

  it('shows 30-minute time slots like the restaurant reservation page', () => {
    render(<AnywhereReservationPage />)

    expect(screen.getByRole('button', { name: '11:00' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '11:30' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '20:00' })).toBeTruthy()
  })

  it('does not require request note for submit', () => {
    render(<AnywhereReservationPage />)

    fireEvent.change(screen.getByPlaceholderText('식당명을 입력해주세요.'), {
      target: { value: '키츠라멘' },
    })
    fireEvent.change(screen.getByPlaceholderText('식당 주소를 입력해주세요.'), {
      target: { value: '도쿄 키츠라멘 본점' },
    })
    fireEvent.change(
      screen.getByPlaceholderText('예약자 성함을 입력해주세요.'),
      {
        target: { value: '김하시' },
      },
    )
    fireEvent.click(screen.getByRole('button', { name: '어른 인원 늘리기' }))
    fireEvent.click(screen.getByRole('button', { name: '2026년 6월 2일' }))
    fireEvent.click(screen.getByRole('button', { name: '11:30' }))

    expect(screen.getByRole('button', { name: '예약하기' })).toBeEnabled()
  })

  it('disables today and previous dates', () => {
    vi.setSystemTime(new Date(2026, 5, 15, 9))

    render(<AnywhereReservationPage />)

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
    render(<AnywhereReservationPage />)

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
