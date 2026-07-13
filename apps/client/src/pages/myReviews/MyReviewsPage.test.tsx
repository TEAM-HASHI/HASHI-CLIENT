import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { deleteReview } from '@/features/review/api/deleteReview'
import { getMyReviewCount } from '@/features/review/api/getMyReviewCount'
import { getVisitedReservations } from '@/features/review/api/getVisitedReservations'
import { getMyReviews } from '@/pages/myReviews/api/myReviewsApi'
import { MyReviewsPage } from '@/pages/myReviews/MyReviewsPage'
import emptyImage from '@/shared/assets/images/empty.webp'

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

vi.mock('@/pages/myReviews/api/myReviewsApi', () => ({
  getMyReviews: vi.fn(),
}))

vi.mock('@/features/review/api/deleteReview', () => ({
  deleteReview: vi.fn(),
}))

vi.mock('@/features/review/api/getMyReviewCount', () => ({
  getMyReviewCount: vi.fn(),
}))

vi.mock('@/features/review/api/getVisitedReservations', () => ({
  getVisitedReservations: vi.fn(),
}))

const writableReservations = [
  {
    adultCount: 2,
    reservationId: 23,
    restaurantId: 1,
    restaurantName: '아키토리 라멘',
    visitedAt: '2026-06-28T19:00:00+09:00',
  },
  {
    adultCount: 1,
    reservationId: 22,
    restaurantId: 2,
    restaurantName: '하시 스시',
    visitedAt: '2026-06-22T17:00:00+09:00',
  },
]

const writtenReviews = Array.from({ length: 4 }, (_, index) => ({
  rating: 5,
  reviewId: 31 + index,
  restaurantId: index + 1,
  restaurantName: `작성한 식당 ${index + 1}`,
  visitedAt: '2026-06-22T17:00:00+09:00',
}))

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MyReviewsPage />
    </QueryClientProvider>,
  )
}

describe('MyReviewsPage', () => {
  beforeEach(() => {
    vi.mocked(getVisitedReservations).mockResolvedValue({
      content: writableReservations,
      hasNext: false,
      totalCount: 2,
    })
    vi.mocked(getMyReviews).mockResolvedValue({
      content: writtenReviews,
      hasNext: false,
    })
    vi.mocked(getMyReviewCount).mockResolvedValue({ myReviewCount: 4 })
    vi.mocked(deleteReview).mockResolvedValue(null)
  })

  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
    vi.clearAllMocks()
  })

  it('renders API-backed writable reviews and their server count', async () => {
    renderPage()

    expect(screen.getByText('리뷰 목록을 불러오는 중입니다.')).toBeVisible()
    expect(
      await screen.findByRole('tab', { name: '리뷰 쓰기 2' }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: '작성한 리뷰 4' })).toBeVisible()
    expect(getVisitedReservations).not.toHaveBeenCalledWith({
      reviewStatus: 'reviewed',
      size: 1,
    })
    expect(
      screen.getByText((_, element) => element?.textContent === '총 2건'),
    ).toBeVisible()
    expect(screen.getAllByRole('button', { name: '리뷰 작성' })).toHaveLength(2)
  })

  it('navigates to review new with restaurant and reservation IDs', async () => {
    renderPage()

    fireEvent.click(
      (await screen.findAllByRole('button', { name: '리뷰 작성' }))[0],
    )

    expect(mockNavigate).toHaveBeenCalledWith(
      '/restaurants/1/reviews/new?reservationId=23',
    )
  })

  it('loads written reviews after tab change and opens one menu at a time', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('tab', { name: '작성한 리뷰 4' }))
    const menuButtons = await screen.findAllByLabelText(/리뷰 메뉴 열기/)

    fireEvent.click(menuButtons[0])
    fireEvent.click(menuButtons[1])

    expect(screen.getAllByRole('menuitem', { name: '수정하기' })).toHaveLength(
      1,
    )
    expect(screen.getAllByRole('img', { name: '평점 5점' })).toHaveLength(4)
    expect(
      screen.getByText((_, element) => element?.textContent === '총 4건'),
    ).toBeVisible()
  })

  it('navigates to the API review detail', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('tab', { name: '작성한 리뷰 4' }))
    fireEvent.click(
      (await screen.findAllByRole('button', { name: /리뷰 상세 보기/ }))[0],
    )

    expect(mockNavigate).toHaveBeenCalledWith('/reviews/31')
  })

  it('deletes through the API and refreshes the written list', async () => {
    vi.mocked(getMyReviews)
      .mockResolvedValueOnce({ content: [writtenReviews[0]], hasNext: false })
      .mockResolvedValue({ content: [], hasNext: false })
    vi.mocked(getMyReviewCount)
      .mockResolvedValueOnce({ myReviewCount: 1 })
      .mockResolvedValue({ myReviewCount: 0 })
    const { container } = renderPage()

    fireEvent.click(await screen.findByRole('tab', { name: '작성한 리뷰 1' }))
    fireEvent.click((await screen.findAllByLabelText(/리뷰 메뉴 열기/))[0])
    fireEvent.click(screen.getByRole('menuitem', { name: '삭제하기' }))
    fireEvent.click(screen.getByRole('button', { name: '삭제하기' }))

    await waitFor(() =>
      expect(deleteReview).toHaveBeenCalledWith(31, expect.anything()),
    )
    expect(await screen.findByText('작성한 리뷰가 없어요.')).toBeVisible()
    expect(
      container.querySelector(`img[src="${emptyImage}"]`),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '일본 맛집 추천받기' }),
    ).toBeVisible()
    expect(screen.getByRole('tab', { name: '작성한 리뷰 0' })).toBeVisible()
  })

  it('shows a local error state and retries the active list', async () => {
    let writableRequestCount = 0

    vi.mocked(getVisitedReservations).mockImplementation(async () => {
      writableRequestCount += 1

      if (writableRequestCount === 1) {
        throw new Error('network')
      }

      return {
        content: writableReservations,
        hasNext: false,
        totalCount: 2,
      }
    })
    renderPage()

    expect(
      await screen.findByText('리뷰 목록을 불러오지 못했습니다.'),
    ).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(
      (await screen.findAllByRole('button', { name: '리뷰 작성' }))[0],
    ).toBeVisible()
    expect(writableRequestCount).toBe(2)
  })

  it('navigates back to mypage', async () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.mypage)
  })
})
