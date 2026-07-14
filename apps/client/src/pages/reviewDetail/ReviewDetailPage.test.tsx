import '@testing-library/jest-dom/vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
import { deleteReview } from '@/features/review/api/deleteReview'
import { REVIEW_PHOTO_MAX_COUNT } from '@/features/review/constants'
import { getMyReviewDetail } from '@/pages/reviewDetail/api/getMyReviewDetail'
import { ReviewDetailContentCard } from '@/pages/reviewDetail/components/ReviewDetailContentCard'
import { ReviewDetailPage } from '@/pages/reviewDetail/ReviewDetailPage'

const { locationState, navigateMock, reviewIdParam } = vi.hoisted(() => ({
  locationState: { current: null as unknown },
  navigateMock: vi.fn(),
  reviewIdParam: { current: '5' },
}))

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ state: locationState.current }),
  useNavigate: () => navigateMock,
  useParams: () => ({ reviewId: reviewIdParam.current }),
}))

vi.mock('@/pages/reviewDetail/api/getMyReviewDetail', () => ({
  getMyReviewDetail: vi.fn(),
}))

vi.mock('@/features/review/api/deleteReview', () => ({
  deleteReview: vi.fn(),
}))

const reviewDetailResponse = {
  adultCount: 2,
  childCount: 1,
  content: '정말 맛있습니다. 다음에도 방문하고 싶어요.',
  createdAt: '2026-07-12T13:11:01.19277',
  imageUrls: ['https://cdn.hashi.kr/review-1.jpg'],
  keywords: ['음식이 맛있어요', '직원분이 친절해요', '가성비가 좋아요'],
  rating: 4,
  reviewId: 5,
  restaurantName: '아키토리 라멘',
  restaurantThumbnailUrl: 'https://cdn.hashi.kr/restaurant.jpg',
  visitedAt: '2026-06-12T18:30:00',
}

const writtenReviewsLocation = {
  pathname: ROUTES.myReviews,
  search: '?tab=written',
}

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ReviewDetailPage />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  locationState.current = null
  reviewIdParam.current = '5'
  vi.mocked(deleteReview).mockResolvedValue(null)
  vi.mocked(getMyReviewDetail).mockResolvedValue(reviewDetailResponse)
})

afterEach(() => {
  cleanup()
  navigateMock.mockClear()
  vi.clearAllMocks()
})

describe('ReviewDetailPage', () => {
  it('renders the API review detail', async () => {
    renderPage()

    expect(screen.getByText('리뷰 정보를 불러오는 중입니다.')).toBeVisible()
    expect(await screen.findByText('아키토리 라멘')).toBeVisible()
    expect(screen.getByText('2026. 6. 12 18:30 방문')).toBeVisible()
    expect(screen.getByText('어른 2명 · 어린이 1명')).toBeVisible()
    expect(screen.getByRole('img', { name: '평점 4점' })).toBeVisible()
    expect(screen.getByText('2026.07.12')).toBeVisible()
    expect(screen.getByText('음식이 맛있어요')).toBeVisible()
    expect(screen.getByText('직원분이 친절해요')).toBeVisible()
    expect(screen.getByText('가성비가 좋아요')).toBeVisible()
    const keywordList = screen.getByRole('list', {
      name: '선택한 리뷰 키워드',
    })

    expect(keywordList).toHaveClass(
      'overflow-x-auto',
      '[scrollbar-width:none]',
      '[&::-webkit-scrollbar]:hidden',
    )
    expect(keywordList).not.toHaveClass('flex-wrap')
    expect(keywordList.querySelectorAll('svg')).toHaveLength(3)
    expect(getMyReviewDetail).toHaveBeenCalledWith(5)
  })

  it('shows a local error and retries the detail request', async () => {
    vi.mocked(getMyReviewDetail)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(reviewDetailResponse)
    renderPage()

    expect(
      await screen.findByText('리뷰 정보를 불러오지 못했습니다.'),
    ).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByText('아키토리 라멘')).toBeVisible()
    expect(getMyReviewDetail).toHaveBeenCalledTimes(2)
  })

  it('moves to my reviews when the back button is clicked', async () => {
    renderPage()

    await screen.findByText('아키토리 라멘')
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(navigateMock).toHaveBeenCalledWith(writtenReviewsLocation)
  })

  it('moves to the return path when the review detail is opened from visited reservations', async () => {
    locationState.current = {
      returnTo: `${ROUTES.myReservations}?status=VISITED`,
    }
    renderPage()

    await screen.findByText('아키토리 라멘')
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(navigateMock).toHaveBeenCalledWith(
      `${ROUTES.myReservations}?status=VISITED`,
    )
  })

  it('opens the delete confirmation dialog and closes it from cancel', async () => {
    renderPage()

    await screen.findByText('아키토리 라멘')
    fireEvent.click(screen.getByRole('button', { name: '삭제하기' }))

    const dialog = screen.getByRole('alertdialog', {
      name: '리뷰 삭제 확인',
    })

    expect(within(dialog).getByText('정말 삭제하시겠습니까?')).toBeVisible()
    fireEvent.click(within(dialog).getByRole('button', { name: '취소하기' }))

    expect(
      screen.queryByRole('alertdialog', { name: '리뷰 삭제 확인' }),
    ).not.toBeInTheDocument()
  })

  it('deletes the review before moving to my reviews', async () => {
    renderPage()

    await screen.findByText('아키토리 라멘')
    fireEvent.click(screen.getByRole('button', { name: '삭제하기' }))
    const dialog = screen.getByRole('alertdialog', {
      name: '리뷰 삭제 확인',
    })
    fireEvent.click(within(dialog).getByRole('button', { name: '삭제하기' }))

    await waitFor(() =>
      expect(deleteReview).toHaveBeenCalledWith(5, expect.anything()),
    )
    expect(navigateMock).toHaveBeenCalledWith(writtenReviewsLocation)
  })

  it('keeps the delete dialog open when deletion fails', async () => {
    vi.mocked(deleteReview).mockRejectedValue(new Error('network'))
    renderPage()

    await screen.findByText('아키토리 라멘')
    fireEvent.click(screen.getByRole('button', { name: '삭제하기' }))
    const dialog = screen.getByRole('alertdialog', {
      name: '리뷰 삭제 확인',
    })
    fireEvent.click(within(dialog).getByRole('button', { name: '삭제하기' }))

    await waitFor(() => expect(deleteReview).toHaveBeenCalled())
    expect(dialog).toBeVisible()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it.each(['1e2', '0x10', '5.0', '0', '-1', 'not-a-number'])(
    'rejects non-canonical review ID %s and returns to my reviews',
    async (invalidReviewId) => {
      reviewIdParam.current = invalidReviewId
      renderPage()

      const backToListButton = await screen.findByRole('button', {
        name: '마이 리뷰로 돌아가기',
      })

      expect(getMyReviewDetail).not.toHaveBeenCalled()
      expect(screen.queryByRole('button', { name: '다시 시도' })).toBeNull()
      fireEvent.click(backToListButton)
      expect(navigateMock).toHaveBeenCalledWith(writtenReviewsLocation)
    },
  )

  it('opens the coming soon dialog from the edit button', async () => {
    renderPage()

    await screen.findByText('아키토리 라멘')
    fireEvent.click(screen.getByRole('button', { name: '수정하기' }))

    expect(screen.getByText('서비스를 준비하고 있어요.')).toBeVisible()
  })
})

describe('ReviewDetailContentCard', () => {
  it('renders up to ten review images in the horizontal image list', () => {
    const images = Array.from(
      { length: REVIEW_PHOTO_MAX_COUNT + 1 },
      (_, index) => ({
        id: `review-image-${index}`,
        src: `https://example.com/review-image-${index}.jpg`,
        alt: `리뷰 이미지 ${index}`,
      }),
    )

    render(
      <ReviewDetailContentCard
        content="정말 맛있습니다. 다음에도 또 방문하고 싶은 곳이에요."
        images={images}
        keywordIds={[]}
        rating={4}
        writtenDate="2026.06.28"
      />,
    )

    const imageList = screen.getByRole('list', { name: '리뷰 이미지 목록' })
    const imageItems = within(imageList).getAllByRole('img')

    expect(imageList.closest('article')).toHaveClass('mx-5')
    expect(imageItems).toHaveLength(REVIEW_PHOTO_MAX_COUNT)
    expect(imageItems[0]).toHaveClass('rounded-[10px]')
    expect(screen.queryByAltText('리뷰 이미지 10')).not.toBeInTheDocument()
  })
})
