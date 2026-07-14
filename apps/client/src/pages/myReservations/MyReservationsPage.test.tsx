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
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { cancelReservation } from '@/features/reservation/api/cancelReservation'
import { getVisitedReservations } from '@/features/review/api/getVisitedReservations'
import { useMyProfileSummaryQuery } from '@/features/user'
import { getMyReservations } from '@/features/reservation/api/getMyReservations'
import { MyReservationsPage } from '@/pages/myReservations/MyReservationsPage'
import { createQueryClient } from '@/shared/lib/queryClient'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'

const { mockShowToast } = vi.hoisted(() => ({
  mockShowToast: vi.fn(),
}))

vi.mock('@/features/reservation/api/getMyReservations', () => ({
  getMyReservations: vi.fn(),
}))

vi.mock('@/features/reservation/api/cancelReservation', () => ({
  cancelReservation: vi.fn(),
}))

vi.mock('@/features/review/api/getVisitedReservations', () => ({
  getVisitedReservations: vi.fn(),
}))

vi.mock('@/features/user', () => ({
  useMyProfileSummaryQuery: vi.fn(),
}))

vi.mock('@hashi/hds-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hashi/hds-ui')>()

  return {
    ...actual,
    showToast: mockShowToast,
  }
})

const mockedGetMyReservations = vi.mocked(getMyReservations)
const mockedGetVisitedReservations = vi.mocked(getVisitedReservations)
const mockedCancelReservation = vi.mocked(cancelReservation)
const mockedUseMyProfileSummaryQuery = vi.mocked(useMyProfileSummaryQuery)

const LocationPath = () => {
  const location = useLocation()

  return (
    <>
      <div data-testid="location-path">{location.pathname}</div>
      <div data-testid="location-state">{JSON.stringify(location.state)}</div>
    </>
  )
}

const renderMyReservationsPage = (
  initialEntry: string = ROUTES.myReservations,
) => {
  const queryClient = createQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            element={
              <>
                <MyReservationsPage />
                <LocationPath />
              </>
            }
            path={ROUTES.myReservations}
          />
          <Route element={<LocationPath />} path={ROUTES.reservationDetail} />
          <Route element={<LocationPath />} path={ROUTES.popularRestaurants} />
          <Route element={<LocationPath />} path={ROUTES.reviewDetail} />
          <Route element={<LocationPath />} path={ROUTES.reviewNew} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MyReservationsPage', () => {
  beforeEach(() => {
    mockedUseMyProfileSummaryQuery.mockReturnValue({
      data: {
        nickname: '권혁준',
        profileImageUrl: 'https://example.com/profile.png',
      },
      error: null,
    } as ReturnType<typeof useMyProfileSummaryQuery>)
    mockedCancelReservation.mockResolvedValue({
      message: '예약 취소 요청이 완료되었습니다',
      reservation: {
        reservationId: 21,
        restaurantId: 34,
        restaurantName: '스시 하시',
        reservedAt: '2026-07-20T18:30:00',
        adultCount: 2,
        reservationStatus: 'CANCELED',
      },
    })
    mockedGetMyReservations.mockResolvedValue({
      reservations: [
        {
          reservationId: 12,
          restaurantId: 34,
          restaurantName: '스시 하시',
          reservedAt: '2026-07-20T18:30:00',
          adultCount: 2,
          reservationStatus: 'REQUESTED',
          confirmDDay: 3,
        },
      ],
      hasNext: false,
      totalCount: 7,
    })
    mockedGetVisitedReservations.mockResolvedValue({
      content: [
        {
          reservationId: 31,
          restaurantId: 41,
          restaurantName: '방문한 스시',
          restaurantThumbnailUrl: 'https://example.com/visited.png',
          visitedAt: '2026-07-10T18:30:00',
          adultCount: 2,
          reviewStatus: 'REVIEWED',
          reviewId: 51,
          rating: 4,
          earnedPoint: 300,
        },
      ],
      hasNext: false,
      totalCount: 7,
    })
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    mockShowToast.mockClear()
  })

  it('renders in-progress reservations from the reservations API', async () => {
    renderMyReservationsPage()

    expect(mockedGetMyReservations).toHaveBeenCalledWith({
      cursor: null,
      size: 10,
      status: 'IN_PROGRESS',
    })
    expect(await screen.findByText('스시 하시')).toBeInTheDocument()
    expect(
      screen.getByText((_, element) => element?.textContent === '총 7건'),
    ).toBeInTheDocument()
    expect(screen.getByText('3일')).toBeInTheDocument()
  })

  it('loads the next reservation page when the bottom sentinel intersects', async () => {
    const { triggerIntersect } = mockIntersectionObserver()

    mockedGetMyReservations
      .mockResolvedValueOnce({
        reservations: [
          {
            reservationId: 12,
            restaurantId: 34,
            restaurantName: '스시 하시',
            reservedAt: '2026-07-20T18:30:00',
            adultCount: 2,
            reservationStatus: 'REQUESTED',
            confirmDDay: 3,
          },
        ],
        nextCursor: 20,
        hasNext: true,
        totalCount: 2,
      })
      .mockResolvedValueOnce({
        reservations: [
          {
            reservationId: 13,
            restaurantId: 35,
            restaurantName: '라멘 하시',
            reservedAt: '2026-07-21T12:00:00',
            adultCount: 1,
            reservationStatus: 'CONTACTING',
            confirmDDay: 2,
          },
        ],
        hasNext: false,
        totalCount: 2,
      })

    renderMyReservationsPage()

    expect(await screen.findByText('스시 하시')).toBeInTheDocument()

    triggerIntersect()

    expect(await screen.findByText('라멘 하시')).toBeInTheDocument()
    await waitFor(() => {
      expect(mockedGetMyReservations).toHaveBeenLastCalledWith({
        cursor: 20,
        size: 10,
        status: 'IN_PROGRESS',
      })
    })
  })

  it('does not request the same next reservation page twice when the sentinel intersects repeatedly', async () => {
    const { triggerIntersect } = mockIntersectionObserver()

    mockedGetMyReservations
      .mockResolvedValueOnce({
        reservations: [
          {
            reservationId: 12,
            restaurantId: 34,
            restaurantName: '스시 하시',
            reservedAt: '2026-07-20T18:30:00',
            adultCount: 2,
            reservationStatus: 'REQUESTED',
            confirmDDay: 3,
          },
        ],
        nextCursor: 20,
        hasNext: true,
        totalCount: 2,
      })
      .mockResolvedValueOnce({
        reservations: [
          {
            reservationId: 13,
            restaurantId: 35,
            restaurantName: '라멘 하시',
            reservedAt: '2026-07-21T12:00:00',
            adultCount: 1,
            reservationStatus: 'CONTACTING',
            confirmDDay: 2,
          },
        ],
        hasNext: false,
        totalCount: 2,
      })

    renderMyReservationsPage()

    expect(await screen.findByText('스시 하시')).toBeInTheDocument()

    triggerIntersect()
    triggerIntersect()

    expect(await screen.findByText('라멘 하시')).toBeInTheDocument()
    expect(mockedGetMyReservations).toHaveBeenCalledTimes(2)
  })

  it('keeps rendered reservations when loading the next page fails', async () => {
    const { triggerIntersect } = mockIntersectionObserver()

    mockedGetMyReservations
      .mockResolvedValueOnce({
        reservations: [
          {
            reservationId: 12,
            restaurantId: 34,
            restaurantName: '스시 하시',
            reservedAt: '2026-07-20T18:30:00',
            adultCount: 2,
            reservationStatus: 'REQUESTED',
            confirmDDay: 3,
          },
        ],
        nextCursor: 20,
        hasNext: true,
        totalCount: 2,
      })
      .mockRejectedValueOnce(new Error('next page failed'))

    renderMyReservationsPage()

    expect(await screen.findByText('스시 하시')).toBeInTheDocument()

    triggerIntersect()

    await waitFor(() => {
      expect(mockedGetMyReservations).toHaveBeenCalledTimes(2)
    })
    expect(screen.getByText('스시 하시')).toBeInTheDocument()
  })

  it('renders visited reservations from the visited reservations API', async () => {
    renderMyReservationsPage(`${ROUTES.myReservations}?status=VISITED`)

    await waitFor(() => {
      expect(mockedGetMyReservations).not.toHaveBeenCalled()
      expect(mockedGetVisitedReservations).toHaveBeenCalledWith({
        cursor: undefined,
        reviewStatus: 'all',
        size: 10,
      })
    })
    expect(await screen.findByText('방문한 스시')).toBeInTheDocument()
    expect(
      screen.getByText((_, element) => element?.textContent === '총 7건'),
    ).toBeInTheDocument()
    expect(screen.getByText('리뷰 작성 완료!')).toBeInTheDocument()
    expect(screen.getByText('+300P')).toBeInTheDocument()
  })

  it('navigates from reviewed visited reservations to review detail', async () => {
    mockedGetVisitedReservations.mockResolvedValue({
      content: [
        {
          reservationId: 31,
          restaurantId: 41,
          restaurantName: '작성 완료 식당',
          visitedAt: '2026-07-10T18:30:00',
          adultCount: 2,
          reviewStatus: 'REVIEWED',
          reviewId: 51,
          rating: 4,
          earnedPoint: 300,
        },
      ],
      hasNext: false,
      totalCount: 1,
    })

    renderMyReservationsPage(`${ROUTES.myReservations}?status=VISITED`)

    fireEvent.click(
      await screen.findByRole('button', { name: /리뷰 작성 완료/ }),
    )
    expect(screen.getByTestId('location-path')).toHaveTextContent('/reviews/51')
    expect(screen.getByTestId('location-state')).toHaveTextContent(
      JSON.stringify({
        returnTo: `${ROUTES.myReservations}?status=VISITED`,
      }),
    )
  })

  it('navigates from unreviewed visited reservations to review new', async () => {
    mockedGetVisitedReservations.mockResolvedValue({
      content: [
        {
          reservationId: 32,
          restaurantId: 42,
          restaurantName: '작성 예정 식당',
          visitedAt: '2026-07-11T18:30:00',
          adultCount: 1,
          reviewStatus: 'UNREVIEWED',
          reviewable: true,
        },
      ],
      hasNext: false,
      totalCount: 1,
    })

    renderMyReservationsPage(`${ROUTES.myReservations}?status=VISITED`)

    fireEvent.click(
      await screen.findByRole('button', { name: /이 맛집 어떠셨나요/ }),
    )
    expect(screen.getByTestId('location-path')).toHaveTextContent(
      '/restaurants/42/reviews/new',
    )
  })

  it('keeps unreviewable visited reservations without a restaurant id and disables review navigation', async () => {
    mockedGetVisitedReservations.mockResolvedValue({
      content: [
        {
          reservationId: 32,
          restaurantId: undefined,
          restaurantName: '어디든 예약',
          visitedAt: '2026-07-11T18:30:00',
          adultCount: 1,
          reviewStatus: 'UNREVIEWED',
          reviewable: false,
          reviewUnavailableReason: 'UNSUPPORTED_RESERVATION_TYPE',
        },
      ],
      hasNext: false,
      totalCount: 1,
    })

    renderMyReservationsPage(`${ROUTES.myReservations}?status=VISITED`)

    expect(await screen.findByText('어디든 예약')).toBeInTheDocument()
    expect(
      screen.queryByText('리뷰 작성이 어려운 예약이에요'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('이 맛집 어떠셨나요?')).not.toBeInTheDocument()
    expect(screen.queryByText('리뷰 작성 완료!')).not.toBeInTheDocument()
  })

  it('renders deleted reviews as a non-interactive status', async () => {
    mockedGetVisitedReservations.mockResolvedValue({
      content: [
        {
          reservationId: 33,
          restaurantId: 43,
          restaurantName: '삭제된 리뷰 식당',
          visitedAt: '2026-07-11T18:30:00',
          adultCount: 1,
          reviewStatus: 'DELETED',
          reviewable: false,
        },
      ],
      hasNext: false,
      totalCount: 1,
    })

    renderMyReservationsPage(`${ROUTES.myReservations}?status=VISITED`)

    const deletedReviewStatus =
      await screen.findByText('리뷰가 삭제된 예약입니다')

    expect(deletedReviewStatus).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '리뷰가 삭제된 예약입니다' }),
    ).not.toBeInTheDocument()
    fireEvent.click(deletedReviewStatus)
    expect(screen.getByTestId('location-path')).toHaveTextContent(
      ROUTES.myReservations,
    )
  })

  it('navigates to reservation detail with reservation id when detail is pressed', async () => {
    renderMyReservationsPage()

    fireEvent.click(await screen.findByRole('button', { name: '상세보기' }))

    expect(screen.getByTestId('location-path')).toHaveTextContent(
      '/reservations/12',
    )
  })

  it('navigates from upcoming reservation card to reservation detail', async () => {
    mockedGetMyReservations.mockResolvedValue({
      reservations: [
        {
          reservationId: 21,
          restaurantId: 34,
          restaurantName: '방문 예정 식당',
          reservedAt: '2026-07-20T18:30:00',
          adultCount: 2,
          reservationStatus: 'CONFIRMED',
        },
      ],
      hasNext: false,
      totalCount: 1,
    })

    renderMyReservationsPage(`${ROUTES.myReservations}?status=UPCOMING`)

    fireEvent.click(await screen.findByText('방문 예정 식당'))

    expect(screen.getByTestId('location-path')).toHaveTextContent(
      '/reservations/21',
    )
  })

  it('cancels an upcoming reservation and shows the server message', async () => {
    mockedGetMyReservations
      .mockResolvedValueOnce({
        reservations: [
          {
            reservationId: 21,
            restaurantId: 34,
            restaurantName: '스시 하시',
            reservedAt: '2026-07-20T18:30:00',
            adultCount: 2,
            reservationStatus: 'CONFIRMED',
          },
        ],
        hasNext: false,
        totalCount: 1,
      })
      .mockResolvedValue({
        reservations: [
          {
            reservationId: 21,
            restaurantId: 34,
            restaurantName: '스시 하시',
            reservedAt: '2026-07-20T18:30:00',
            adultCount: 2,
            reservationStatus: 'CANCELED',
          },
        ],
        hasNext: false,
        totalCount: 1,
      })

    renderMyReservationsPage(`${ROUTES.myReservations}?status=UPCOMING`)

    fireEvent.click(await screen.findByRole('button', { name: '취소하기' }))
    const dialog = screen.getByRole('alertdialog')
    fireEvent.click(
      within(dialog).getByRole('button', {
        name: '취소하기',
      }),
    )

    await waitFor(() => {
      expect(mockedCancelReservation).toHaveBeenCalledWith(21)
      expect(mockShowToast).toHaveBeenCalledWith({
        children: '예약 취소 요청이 완료되었습니다',
      })
      expect(
        screen.getByText((_, element) => element?.textContent === '총 1건'),
      ).toBeInTheDocument()
      expect(mockedGetMyReservations).toHaveBeenLastCalledWith({
        cursor: null,
        size: 10,
        status: 'CANCELED',
      })
    })
  })

  it('keeps the cancel dialog open when the close button is pressed immediately after confirm', async () => {
    let resolveCancel: (
      value: Awaited<ReturnType<typeof cancelReservation>>,
    ) => void
    const cancelPromise = new Promise<
      Awaited<ReturnType<typeof cancelReservation>>
    >((resolve) => {
      resolveCancel = resolve
    })

    mockedCancelReservation.mockReturnValue(cancelPromise)
    mockedGetMyReservations.mockResolvedValue({
      reservations: [
        {
          reservationId: 21,
          restaurantId: 34,
          restaurantName: '스시 하시',
          reservedAt: '2026-07-20T18:30:00',
          adultCount: 2,
          reservationStatus: 'CONFIRMED',
        },
      ],
      hasNext: false,
      totalCount: 1,
    })

    renderMyReservationsPage(`${ROUTES.myReservations}?status=UPCOMING`)

    fireEvent.click(await screen.findByRole('button', { name: '취소하기' }))
    const dialog = screen.getByRole('alertdialog')

    fireEvent.click(within(dialog).getByRole('button', { name: '취소하기' }))
    fireEvent.click(within(dialog).getByRole('button', { name: '닫기' }))

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()

    resolveCancel!({
      message: '예약 취소 요청이 완료되었습니다',
      reservation: {
        reservationId: 21,
        restaurantId: 34,
        restaurantName: '스시 하시',
        reservedAt: '2026-07-20T18:30:00',
        adultCount: 2,
        reservationStatus: 'CANCELED',
      },
    })
  })
})
