import '@testing-library/jest-dom/vitest'

import { QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { getRestaurants } from '@/features/restaurantList/api/getRestaurants'
import { getReservationDetail } from '@/pages/reservationDetail/api/getReservationDetail'
import { ReservationRescuePage } from '@/pages/reservationRescue/ReservationRescuePage'
import { createQueryClient } from '@/shared/lib/queryClient'

const { mockNavigate, mockReservationParams } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockReservationParams: { reservationId: '12' },
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

vi.mock('@/pages/reservationDetail/api/getReservationDetail', () => ({
  getReservationDetail: vi.fn(),
}))

vi.mock('@/features/restaurantList/api/getRestaurants', () => ({
  getRestaurants: vi.fn(),
}))

const mockedGetReservationDetail = vi.mocked(getReservationDetail)
const mockedGetRestaurants = vi.mocked(getRestaurants)

const canceledReservationFixture = {
  reservationId: 12,
  reservationStatus: 'CANCELED' as const,
  restaurantId: 2,
  restaurantName: '취소한 식당',
}

const restaurantFixtures = [
  {
    restaurantId: 1,
    name: '긴자 사사키',
    rating: 4.9,
    area: '긴자',
    foodCategory: 'sushi',
    summary: '정갈한 스시 오마카세',
  },
  {
    restaurantId: 2,
    name: '취소한 식당',
    rating: 4.8,
  },
  {
    restaurantId: 3,
    name: '스시 아오이',
    rating: 4.7,
    area: '신주쿠',
    foodCategory: 'sushi',
    summary: '현지인이 즐겨 찾는 스시야',
  },
  {
    restaurantId: 4,
    name: '쿠로다',
    rating: 4.6,
    area: '시부야',
    foodCategory: 'grill',
    summary: '숯불 향이 좋은 구이 전문점',
  },
  {
    restaurantId: 5,
    name: '다이닝 하시',
    rating: 4.5,
  },
]

const renderPage = () => {
  const queryClient = createQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <ReservationRescuePage />
    </QueryClientProvider>,
  )
}

describe('ReservationRescuePage', () => {
  beforeEach(() => {
    mockReservationParams.reservationId = '12'
    mockNavigate.mockReset()
    mockedGetReservationDetail.mockResolvedValue(canceledReservationFixture)
    mockedGetRestaurants.mockResolvedValue({
      hasNext: false,
      nextCursor: undefined,
      restaurants: restaurantFixtures,
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders up to three HASHI PICK restaurants without the canceled restaurant', async () => {
    renderPage()

    expect(
      await screen.findByRole('heading', {
        name: '예약은 취소됐지만, 맛있는 일정은 계속돼요',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByText('취소한 식당')).not.toBeInTheDocument()
    expect(await screen.findByText('긴자 사사키')).toBeInTheDocument()
    expect(screen.getByText('스시 아오이')).toBeInTheDocument()
    expect(screen.getByText('쿠로다')).toBeInTheDocument()
    expect(screen.queryByText('다이닝 하시')).not.toBeInTheDocument()
  })

  it('keeps the canceled reservations action fixed without covering the list', async () => {
    renderPage()

    const canceledReservationsButton = await screen.findByRole('button', {
      name: '취소된 예약 보기',
    })

    expect(screen.getByRole('main')).toHaveClass(
      'pb-[calc(82px+var(--safe-area-bottom,0px))]',
    )
    expect(canceledReservationsButton.parentElement).toHaveClass(
      'app-mobile-fixed-bottom',
      'z-fixed',
      'bg-white',
      'px-5',
      'pt-4',
      'pb-[calc(17px+var(--safe-area-bottom,0px))]',
    )
  })

  it('moves to restaurant detail when a recommendation is selected', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: /긴자 사사키/ }))

    expect(mockNavigate).toHaveBeenCalledWith('/restaurants/1')
  })

  it('moves to canceled reservations from the header and secondary action', async () => {
    renderPage()

    await screen.findByText('긴자 사사키')
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))
    fireEvent.click(screen.getByRole('button', { name: '취소된 예약 보기' }))

    expect(mockNavigate).toHaveBeenNthCalledWith(
      1,
      `${ROUTES.myReservations}?status=CANCELED`,
      { replace: true },
    )
    expect(mockNavigate).toHaveBeenNthCalledWith(
      2,
      `${ROUTES.myReservations}?status=CANCELED`,
    )
  })

  it('shows an empty state and links to HASHI PICK when no recommendation remains', async () => {
    mockedGetRestaurants.mockResolvedValue({
      hasNext: false,
      nextCursor: undefined,
      restaurants: [restaurantFixtures[1]],
    })

    renderPage()

    expect(
      await screen.findByText('지금 추천할 식당을 찾지 못했어요'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '하시 PICK 둘러보기' }))

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.hashiPickRestaurants)
  })

  it('shows a local error and retries only the recommendation query', async () => {
    mockedGetRestaurants
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({
        hasNext: false,
        nextCursor: undefined,
        restaurants: [],
      })

    renderPage()

    expect(
      await screen.findByText('식당 목록을 불러오지 못했어요'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    await waitFor(() => {
      expect(mockedGetRestaurants).toHaveBeenCalledTimes(2)
    })
    expect(mockedGetReservationDetail).toHaveBeenCalledTimes(1)
  })

  it('shows recommendation skeletons while the restaurant query is pending', async () => {
    mockedGetRestaurants.mockImplementation(
      () =>
        new Promise(() => {
          // 추천 요청을 pending 상태로 유지합니다.
        }),
    )

    renderPage()

    expect(
      await screen.findByLabelText('추천 식당 목록 로딩 중'),
    ).toBeInTheDocument()
  })

  it('replaces to canceled reservations when the route is invalid', async () => {
    mockReservationParams.reservationId = 'invalid'

    renderPage()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `${ROUTES.myReservations}?status=CANCELED`,
        { replace: true },
      )
    })
    expect(mockedGetReservationDetail).not.toHaveBeenCalled()
    expect(mockedGetRestaurants).not.toHaveBeenCalled()
  })

  it('replaces to canceled reservations when the reservation is not canceled', async () => {
    mockedGetReservationDetail.mockResolvedValue({
      ...canceledReservationFixture,
      reservationStatus: 'CONFIRMED',
    })

    renderPage()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `${ROUTES.myReservations}?status=CANCELED`,
        { replace: true },
      )
    })
    expect(mockedGetRestaurants).not.toHaveBeenCalled()
  })
})
