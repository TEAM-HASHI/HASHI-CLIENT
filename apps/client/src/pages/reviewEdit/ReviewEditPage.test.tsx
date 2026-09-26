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
import { getMyReviewDetail } from '@/features/review/api/getMyReviewDetail'
import { ReviewEditPage } from '@/pages/reviewEdit/ReviewEditPage'

const { navigateMock, reviewIdParam } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  reviewIdParam: { current: '5' },
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ reviewId: reviewIdParam.current }),
  }
})

vi.mock('@/features/review/api/getMyReviewDetail', () => ({
  getMyReviewDetail: vi.fn(),
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

  const result = render(
    <QueryClientProvider client={queryClient}>
      <ReviewEditPage />
    </QueryClientProvider>,
  )

  return { ...result, queryClient }
}

beforeEach(() => {
  reviewIdParam.current = '5'
  vi.mocked(getMyReviewDetail).mockResolvedValue(reviewDetailResponse)
})

afterEach(() => {
  cleanup()
  navigateMock.mockClear()
  vi.clearAllMocks()
})

describe('ReviewEditPage', () => {
  it('prefills the edit form from the review detail response', async () => {
    renderPage()

    expect(
      await screen.findByDisplayValue(
        '정말 맛있습니다. 다음에도 방문하고 싶어요.',
      ),
    ).toBeVisible()
    expect(screen.getByRole('radio', { name: '4점' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(
      screen.getByRole('button', { name: '음식이 맛있어요' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('img', { name: '기존 리뷰 사진 1 미리보기' }),
    ).toHaveAttribute('src', 'https://cdn.hashi.kr/review-1.jpg')
    expect(screen.getByText('2026. 6. 12 18:30 방문')).toBeVisible()
    expect(screen.getByText('어른 2명 · 어린이 1명')).toBeVisible()
  })

  it('keeps the fourth keyword unavailable when three saved keywords are selected', async () => {
    renderPage()

    await screen.findByDisplayValue(/정말 맛있습니다/)
    const unselectedKeyword = screen.getByRole('button', {
      name: '향신료가 강하지 않아요',
    })

    expect(unselectedKeyword).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(unselectedKeyword)
    expect(unselectedKeyword).toHaveAttribute('aria-pressed', 'false')
  })

  it('enables save for a valid form without navigating or issuing an update request', async () => {
    renderPage()

    await screen.findByDisplayValue(/정말 맛있습니다/)
    const saveButton = screen.getByRole('button', { name: '저장하기' })

    expect(saveButton).toBeEnabled()
    fireEvent.click(saveButton)
    expect(navigateMock).not.toHaveBeenCalled()
    expect(getMyReviewDetail).toHaveBeenCalledTimes(1)
  })

  it('does not overwrite an edited draft when the detail query refetches', async () => {
    const { queryClient } = renderPage()

    const textarea = await screen.findByLabelText('리뷰 내용')
    fireEvent.change(textarea, {
      target: { value: '수정 중인 리뷰 본문입니다.' },
    })

    await queryClient.invalidateQueries()

    await waitFor(() => expect(getMyReviewDetail).toHaveBeenCalledTimes(2))
    expect(textarea).toHaveValue('수정 중인 리뷰 본문입니다.')
  })

  it('shows an invalid route state without requesting review detail', async () => {
    reviewIdParam.current = '0'
    renderPage()

    const backButton = await screen.findByRole('button', {
      name: '마이 리뷰로 돌아가기',
    })

    expect(getMyReviewDetail).not.toHaveBeenCalled()
    fireEvent.click(backButton)
    expect(navigateMock).toHaveBeenCalledWith(writtenReviewsLocation)
  })

  it('retries a failed review detail query', async () => {
    vi.mocked(getMyReviewDetail)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(reviewDetailResponse)
    renderPage()

    expect(
      await screen.findByText('리뷰 수정 정보를 불러오지 못했습니다.'),
    ).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByDisplayValue(/정말 맛있습니다/)).toBeVisible()
    expect(getMyReviewDetail).toHaveBeenCalledTimes(2)
  })

  it('returns to the previous location from the back button', async () => {
    renderPage()

    await screen.findByDisplayValue(/정말 맛있습니다/)
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(navigateMock).toHaveBeenCalledWith(-1)
  })
})
