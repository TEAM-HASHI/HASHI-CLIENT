import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { restaurantDetailQueryKeys } from '@/features/restaurantDetail'

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
    useParams: () => ({ restaurantId: '10' }),
  }
})

const restaurantMain = {
  restaurantId: 10,
  name: '하시 스시',
  localName: 'HASHI SUSHI',
  rating: 4.7,
  reviewCount: 120,
  summary: '긴자에서 즐기는 오마카세',
  foodCategory: 'SUSHI',
  address: '도쿄도 주오구 긴자 1-1',
  thumbnailUrl: 'https://example.com/thumbnail.webp',
  imageUrls: ['https://example.com/restaurant.webp'],
  reservationFee: 4_000,
}

const restaurantStoreInformation = {
  restaurantId: 10,
  description: '긴자역 인근 스시 전문점',
  businessHours: [
    {
      dayOfWeek: 'MONDAY',
      openTime: '11:00',
      closeTime: '20:00',
      breakStart: undefined,
      breakEnd: undefined,
      closed: false,
    },
    {
      dayOfWeek: 'TUESDAY',
      openTime: '12:00',
      closeTime: '18:00',
      breakStart: '15:00',
      breakEnd: '16:00',
      closed: false,
    },
    {
      dayOfWeek: 'WEDNESDAY',
      openTime: '11:00',
      closeTime: '20:00',
      breakStart: undefined,
      breakEnd: undefined,
      closed: false,
    },
  ],
  priceRange: {
    currency: 'JPY',
    minPrice: 1_000,
    maxPrice: 3_000,
  },
}

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
    },
  })

  queryClient.setQueryData(restaurantDetailQueryKeys.main(10), restaurantMain)
  queryClient.setQueryData(
    restaurantDetailQueryKeys.storeInformation(10),
    restaurantStoreInformation,
  )

  return render(
    <QueryClientProvider client={queryClient}>
      <RestaurantReservationNewPage />
    </QueryClientProvider>,
  )
}

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
    renderPage()

    expect(screen.getByRole('heading', { name: '2026 6월' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
  })

  it('fixes the header to the mobile frame and labels the CTA as the next step', () => {
    renderPage()

    expect(screen.getByTestId('reservation-header')).toHaveClass(
      'app-mobile-fixed-top',
      'z-fixed',
      'bg-white',
    )
    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
  })

  it('renders the shared 1000-character request note textarea', () => {
    renderPage()

    const requestNoteField = screen.getByRole('textbox', {
      name: '요청사항 (선택)',
    })

    expect(requestNoteField.tagName).toBe('TEXTAREA')
    expect(requestNoteField).toHaveAttribute('maxlength', '1000')
    expect(screen.getByText('/1000')).toBeInTheDocument()
  })

  it('keeps time selection disabled until a valid date is selected', () => {
    renderPage()

    const initialTimeButton = screen.getByRole('button', { name: '11:00' })

    expect(initialTimeButton).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: '2026년 6월 2일' }))

    expect(screen.getByRole('button', { name: '12:00' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: '11:00' })).toBeNull()
    expect(screen.queryByRole('button', { name: '15:00' })).toBeNull()
    expect(screen.getByRole('button', { name: '16:00' })).toBeEnabled()
  })

  it('does not keep a time click made before date selection', () => {
    renderPage()

    fireEvent.change(
      screen.getByPlaceholderText('예약자 성함을 입력해주세요.'),
      {
        target: { value: '김하시' },
      },
    )
    fireEvent.click(screen.getByRole('button', { name: '어른 인원 늘리기' }))
    fireEvent.click(screen.getByRole('button', { name: '어른 인원 늘리기' }))

    const timeButton = screen.getByRole('button', { name: '11:00' })

    fireEvent.click(timeButton)
    fireEvent.click(screen.getByRole('button', { name: '2026년 6월 2일' }))

    const submitButton = screen.getByRole('button', { name: '다음' })

    expect(submitButton).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: '12:00' }))

    expect(submitButton).toBeEnabled()
  })

  it('clears the selected time when the reservation date changes', () => {
    renderPage()

    fireEvent.change(
      screen.getByPlaceholderText('예약자 성함을 입력해주세요.'),
      {
        target: { value: '김하시' },
      },
    )
    fireEvent.click(screen.getByRole('button', { name: '어른 인원 늘리기' }))
    fireEvent.click(screen.getByRole('button', { name: '어른 인원 늘리기' }))
    fireEvent.click(screen.getByRole('button', { name: '2026년 6월 2일' }))
    fireEvent.click(screen.getByRole('button', { name: '12:00' }))
    expect(screen.getByRole('button', { name: '다음' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: '2026년 6월 3일' }))

    expect(screen.getByRole('button', { name: '다음' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '11:00' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('enables submit after required values are selected and navigates with reservation state', () => {
    renderPage()

    expect(screen.getByText('하시 스시')).toBeInTheDocument()

    fireEvent.change(
      screen.getByPlaceholderText('예약자 성함을 입력해주세요.'),
      {
        target: { value: '김하시' },
      },
    )
    fireEvent.click(screen.getByRole('button', { name: '어른 인원 늘리기' }))
    fireEvent.click(screen.getByRole('button', { name: '어른 인원 늘리기' }))
    fireEvent.click(screen.getByRole('button', { name: '2026년 6월 2일' }))
    fireEvent.click(screen.getByRole('button', { name: '12:00' }))
    fireEvent.change(screen.getByRole('textbox', { name: '요청사항 (선택)' }), {
      target: { value: '창가 자리 부탁드립니다' },
    })

    const submitButton = screen.getByRole('button', { name: '다음' })

    expect(submitButton).toBeEnabled()

    fireEvent.click(submitButton)

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.reservationRequest, {
      state: {
        restaurantId: '10',
        restaurantName: '하시 스시',
        restaurantAddress: '도쿄도 주오구 긴자 1-1',
        restaurantImageUrl: 'https://example.com/thumbnail.webp',
        reservationFee: 4_000,
        guestName: '김하시',
        guests: {
          adult: 2,
          teen: 0,
          child: 0,
        },
        date: '2026-06-02',
        time: '12:00',
        requestNote: '창가 자리 부탁드립니다',
      },
    })
  })

  it('disables today and previous dates', () => {
    vi.setSystemTime(new Date(2026, 5, 15, 9))

    renderPage()

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

  it('disables dates without open business hours', () => {
    renderPage()

    expect(
      screen.getByRole('button', { name: '2026년 6월 7일' }),
    ).toBeDisabled()
  })

  it('moves back to the previous history entry from the header action', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
