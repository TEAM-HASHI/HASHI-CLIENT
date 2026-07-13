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

import { ReviewNewPage } from '@/pages/reviewNew'
import { createReview } from '@/pages/reviewNew/api/createReview'
import { getReviewContext } from '@/pages/reviewNew/api/getReviewContext'
import { uploadReviewImages } from '@/pages/reviewNew/api/uploadReviewImages'
import { createQueryClient } from '@/shared/lib/queryClient'

const { navigateMock, routeState } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  routeState: { reservationId: '23' },
}))

const createObjectURLMock = vi.fn((file: File) => `blob:${file.name}`)
const revokeObjectURLMock = vi.fn()
const reviewContextResponse = {
  reservationId: 23,
  restaurantId: 1,
  restaurantName: '하시 식당',
  restaurantThumbnailUrl: 'https://cdn.hashi.kr/restaurants/hashi.jpg',
  visitedAt: '2026-06-28T19:00:00',
  adultCount: 2,
  teenCount: 1,
  childCount: 0,
  reviewable: true,
  reviewKeywordOptions: [
    { code: 'FOOD_IS_DELICIOUS', label: '음식이 맛있어요' },
    { code: 'STAFF_IS_KIND', label: '직원분이 친절해요' },
  ],
}

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useSearchParams: () => [
      new URLSearchParams({ reservationId: routeState.reservationId }),
    ],
  }
})

vi.mock('@/pages/reviewNew/api/createReview', () => ({
  createReview: vi.fn(),
}))

vi.mock('@/pages/reviewNew/api/getReviewContext', () => ({
  getReviewContext: vi.fn(),
}))

vi.mock('@/pages/reviewNew/api/uploadReviewImages', () => ({
  uploadReviewImages: vi.fn(),
}))

const createReviewMock = vi.mocked(createReview)
const getReviewContextMock = vi.mocked(getReviewContext)
const uploadReviewImagesMock = vi.mocked(uploadReviewImages)

beforeEach(() => {
  routeState.reservationId = '23'
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: createObjectURLMock,
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: revokeObjectURLMock,
  })
  getReviewContextMock.mockResolvedValue(reviewContextResponse)
  uploadReviewImagesMock.mockResolvedValue([])
  createReviewMock.mockResolvedValue({ reviewId: 501, earnedPoint: 100 })
})

const renderReviewNewPage = () => {
  const queryClient = createQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <ReviewNewPage />
    </QueryClientProvider>,
  )
}

const findReviewContext = async () => {
  await screen.findByText('하시 식당')
}

const fillRequiredReviewFields = () => {
  fireEvent.click(screen.getByRole('radio', { name: '4점' }))
  fireEvent.click(screen.getByRole('button', { name: '직원분이 친절해요' }))
  fireEvent.change(screen.getByLabelText('리뷰 내용'), {
    target: { value: '정말 맛있었어요 최고예요' },
  })
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('ReviewNewPage', () => {
  it('loads and renders the review context from the reservation id', async () => {
    renderReviewNewPage()

    expect(
      screen.getByText('리뷰 작성 정보를 불러오는 중입니다.'),
    ).toBeInTheDocument()
    expect(await screen.findByText('하시 식당')).toBeInTheDocument()
    expect(screen.getByText('2026. 6. 28 19:00 방문')).toBeInTheDocument()
    expect(screen.getByText('어른 2명 · 청소년 1명')).toBeInTheDocument()
    const deliciousKeyword = screen.getByRole('button', {
      name: '음식이 맛있어요',
    })
    const kindKeyword = screen.getByRole('button', {
      name: '직원분이 친절해요',
    })

    expect(deliciousKeyword).toBeInTheDocument()
    expect(deliciousKeyword.querySelector('svg')).not.toBeNull()
    expect(kindKeyword).toBeInTheDocument()
    expect(kindKeyword.querySelector('svg')).not.toBeNull()
    expect(getReviewContextMock).toHaveBeenCalledWith(23)
  })

  it('does not request context for a non-decimal reservation id', () => {
    routeState.reservationId = '1e2'

    renderReviewNewPage()

    expect(
      screen.getByText('리뷰 작성 예약 정보를 확인할 수 없습니다.'),
    ).toBeInTheDocument()
    expect(getReviewContextMock).not.toHaveBeenCalled()
  })

  it('shows an error state when context loading fails', async () => {
    getReviewContextMock.mockRejectedValue(new Error('context failed'))

    renderReviewNewPage()

    expect(
      await screen.findByText('리뷰 작성 정보를 불러오지 못했습니다.'),
    ).toBeInTheDocument()
  })

  it('returns to the entry route from the header', async () => {
    renderReviewNewPage()
    await findReviewContext()

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(navigateMock).toHaveBeenCalledWith(-1)
  })

  it('submits review fields and navigates to the created detail', async () => {
    renderReviewNewPage()
    await findReviewContext()
    fillRequiredReviewFields()

    fireEvent.click(screen.getByRole('button', { name: '저장하기' }))

    await waitFor(() => {
      expect(uploadReviewImagesMock).toHaveBeenCalledWith([])
      expect(createReviewMock).toHaveBeenCalledWith({
        reservationId: 23,
        rating: 4,
        keywordCodes: ['STAFF_IS_KIND'],
        content: '정말 맛있었어요 최고예요',
        imageFileKeys: [],
      })
    })
    expect(navigateMock).toHaveBeenCalledWith('/reviews/501')
  })

  it('submits image file keys returned from the upload flow', async () => {
    renderReviewNewPage()
    await findReviewContext()
    fillRequiredReviewFields()
    const files = [
      new File(['first'], 'first.jpg', { type: 'image/jpeg' }),
      new File(['second'], 'second.png', { type: 'image/png' }),
    ]
    uploadReviewImagesMock.mockResolvedValue([
      'uploads/reviews/review-0.jpg',
      'uploads/reviews/review-1.jpg',
    ])
    fireEvent.change(screen.getByLabelText('리뷰 사진 첨부'), {
      target: { files },
    })

    fireEvent.click(screen.getByRole('button', { name: '저장하기' }))

    await waitFor(() => {
      expect(uploadReviewImagesMock).toHaveBeenCalledWith(files)
      expect(createReviewMock).toHaveBeenCalledWith({
        reservationId: 23,
        rating: 4,
        keywordCodes: ['STAFF_IS_KIND'],
        content: '정말 맛있었어요 최고예요',
        imageFileKeys: [
          'uploads/reviews/review-0.jpg',
          'uploads/reviews/review-1.jpg',
        ],
      })
    })
  })

  it('shows a retryable message and stays on the page when creation fails', async () => {
    createReviewMock.mockRejectedValue(new Error('create failed'))
    renderReviewNewPage()
    await findReviewContext()
    fillRequiredReviewFields()

    fireEvent.click(screen.getByRole('button', { name: '저장하기' }))

    expect(
      await screen.findByRole('alert', {
        name: '리뷰 저장 실패',
      }),
    ).toHaveTextContent('리뷰를 저장하지 못했습니다. 다시 시도해주세요.')
    expect(navigateMock).not.toHaveBeenCalledWith('/reviews/501')
    expect(screen.getByRole('button', { name: '저장하기' })).toBeEnabled()
  })

  it('keeps save disabled when the context says the reservation is not reviewable', async () => {
    getReviewContextMock.mockResolvedValue({
      ...reviewContextResponse,
      reviewable: false,
      reviewUnavailableReason: 'ALREADY_REVIEWED',
    })
    renderReviewNewPage()
    await findReviewContext()
    fillRequiredReviewFields()

    expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled()
  })

  it('keeps the existing photo count and size validation', async () => {
    renderReviewNewPage()
    await findReviewContext()
    const largePhotoFile = new File(['large-image'], 'large-review.png', {
      type: 'image/png',
    })
    Object.defineProperty(largePhotoFile, 'size', { value: 6 * 1024 * 1024 })

    fireEvent.change(screen.getByLabelText('리뷰 사진 첨부'), {
      target: { files: [largePhotoFile] },
    })

    expect(
      screen.getByText('사진은 장당 5MB 이하로 첨부해주세요.'),
    ).toBeInTheDocument()
  })
})
