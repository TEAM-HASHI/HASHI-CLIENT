import '@testing-library/jest-dom/vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { uploadReviewImages } from '@/features/review/api/uploadReviewImages'
import { myReviewQueryKeys } from '@/features/review/queries/myReviewQueryKeys'
import { getReviewEditContext } from '@/pages/reviewEdit/api/getReviewEditContext'
import { updateReview } from '@/pages/reviewEdit/api/updateReview'
import { ReviewEditPage } from '@/pages/reviewEdit/ReviewEditPage'
import { HttpStatusError } from '@/shared/api/apiError'

const {
  createObjectURLMock,
  navigateMock,
  reviewIdParam,
  revokeObjectURLMock,
} = vi.hoisted(() => ({
  createObjectURLMock: vi.fn((file: File) => `blob:${file.name}`),
  navigateMock: vi.fn(),
  reviewIdParam: { current: '5' },
  revokeObjectURLMock: vi.fn(),
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

vi.mock('@/pages/reviewEdit/api/getReviewEditContext', () => ({
  getReviewEditContext: vi.fn(),
}))

vi.mock('@/pages/reviewEdit/api/updateReview', () => ({
  updateReview: vi.fn(),
}))

vi.mock('@/features/review/api/uploadReviewImages', () => ({
  uploadReviewImages: vi.fn(),
}))

const reviewEditContextResponse = {
  adultCount: 2,
  childCount: 1,
  content: '정말 맛있습니다. 다음에도 방문하고 싶어요.',
  images: [
    {
      fileKey: 'uploads/reviews/review-1.jpg',
      imageUrl: 'https://cdn.hashi.kr/review-1.jpg',
      displayOrder: 0,
    },
  ],
  selectedKeywordCodes: ['FOOD_IS_DELICIOUS', 'STAFF_IS_KIND', 'GOOD_VALUE'],
  rating: 4,
  reviewId: 5,
  restaurantId: 9,
  restaurantName: '아키토리 라멘',
  restaurantThumbnailUrl: 'https://cdn.hashi.kr/restaurant.jpg',
  visitedAt: '2026-06-12T18:30:00',
}

const reviewEditContextResponseForSix = {
  ...reviewEditContextResponse,
  content: '여섯 번째 리뷰의 서버 본문입니다.',
  images: [
    {
      fileKey: 'uploads/reviews/review-6.jpg',
      imageUrl: 'https://cdn.hashi.kr/review-6.jpg',
      displayOrder: 0,
    },
  ],
  selectedKeywordCodes: ['PHOTO_FRIENDLY'],
  rating: 2,
  reviewId: 6,
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
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: createObjectURLMock,
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: revokeObjectURLMock,
  })
  vi.mocked(getReviewEditContext).mockResolvedValue(reviewEditContextResponse)
  vi.mocked(updateReview).mockResolvedValue(undefined)
  vi.mocked(uploadReviewImages).mockResolvedValue([])
})

afterEach(() => {
  cleanup()
  createObjectURLMock.mockClear()
  navigateMock.mockClear()
  revokeObjectURLMock.mockClear()
  vi.clearAllMocks()
})

describe('ReviewEditPage', () => {
  it('prefills the edit form from the edit context response', async () => {
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

  it('shows an error when the edit context rejects too many photos', async () => {
    vi.mocked(getReviewEditContext).mockRejectedValue(
      new Error('리뷰 사진 정보를 확인할 수 없습니다.'),
    )
    renderPage()

    expect(
      await screen.findByText('리뷰 수정 정보를 불러오지 못했습니다.'),
    ).toBeVisible()
    expect(screen.queryByRole('button', { name: '저장하기' })).toBeNull()
  })

  it('keeps a new photo preview URL while editing review text', async () => {
    renderPage()
    const textarea = await screen.findByLabelText('리뷰 내용')
    const newFile = new File(['image'], 'new.jpg', { type: 'image/jpeg' })
    fireEvent.change(screen.getByLabelText('리뷰 사진 첨부'), {
      target: { files: [newFile] },
    })

    const createdUrlCount = createObjectURLMock.mock.calls.length
    const revokedUrlCount = revokeObjectURLMock.mock.calls.length
    expect(createdUrlCount).toBeGreaterThan(0)

    fireEvent.change(textarea, {
      target: { value: '사진을 추가한 뒤 본문을 수정했습니다.' },
    })

    expect(createObjectURLMock).toHaveBeenCalledTimes(createdUrlCount)
    expect(revokeObjectURLMock).toHaveBeenCalledTimes(revokedUrlCount)
    expect(
      screen.getByRole('img', { name: 'new.jpg 미리보기' }),
    ).toHaveAttribute('src', 'blob:new.jpg')
  })

  it('restores the saved solo dining code with an icon', async () => {
    vi.mocked(getReviewEditContext).mockResolvedValue({
      ...reviewEditContextResponse,
      selectedKeywordCodes: ['GOOD_FOR_SOLO_DINING'],
    })
    renderPage()
    await screen.findByDisplayValue(/정말 맛있습니다/)
    const soloKeyword = screen.getByRole('button', {
      name: '혼밥하기 좋아요',
    })

    expect(soloKeyword).toHaveAttribute('aria-pressed', 'true')
    expect(soloKeyword.querySelector('svg')).not.toBeNull()
    expect(
      screen.queryByRole('button', { name: '전통적이에요' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장하기' })).toBeEnabled()
    fireEvent.click(soloKeyword)
    expect(soloKeyword).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled()
  })

  it('uses keyword codes and labels supplied by the edit context', async () => {
    vi.mocked(getReviewEditContext).mockResolvedValue({
      ...reviewEditContextResponse,
      selectedKeywordCodes: ['PHOTO_FRIENDLY'],
      reviewKeywordOptions: [
        { code: 'PHOTO_FRIENDLY', label: '사진이 잘 나와요' },
      ],
    })
    renderPage()

    await screen.findByDisplayValue(/정말 맛있습니다/)
    expect(
      screen.getByRole('button', { name: '사진이 잘 나와요' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.queryByRole('button', { name: '음식이 맛있어요' }),
    ).not.toBeInTheDocument()
  })

  it('blocks review text beyond 1,000 characters without disabling a valid edit', async () => {
    renderPage()
    await screen.findByDisplayValue(/정말 맛있습니다/)
    const textarea = screen.getByLabelText('리뷰 내용')
    const saveButton = screen.getByRole('button', { name: '저장하기' })

    fireEvent.change(textarea, { target: { value: '가'.repeat(1000) } })
    expect(textarea).toHaveValue('가'.repeat(1000))
    expect(saveButton).toBeEnabled()

    fireEvent.change(textarea, { target: { value: '가'.repeat(1000) + '나' } })
    expect(textarea).toHaveValue('가'.repeat(1000))
    expect(textarea).toHaveAttribute('maxlength', '1000')
    expect(screen.getByText('1000')).toBeInTheDocument()
    expect(
      screen.queryByText('글자 수 제한을 초과했어요.'),
    ).not.toBeInTheDocument()
    expect(saveButton).toBeEnabled()

    fireEvent.change(textarea, { target: { value: '가'.repeat(999) } })
    expect(textarea).toHaveValue('가'.repeat(999))
    expect(saveButton).toBeEnabled()
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

  it('sends the complete review state and navigates after saving', async () => {
    renderPage()

    await screen.findByDisplayValue(/정말 맛있습니다/)
    const saveButton = screen.getByRole('button', { name: '저장하기' })

    expect(saveButton).toBeEnabled()
    fireEvent.click(saveButton)

    await waitFor(() =>
      expect(updateReview).toHaveBeenCalledWith(5, {
        rating: 4,
        keywordCodes: ['FOOD_IS_DELICIOUS', 'STAFF_IS_KIND', 'GOOD_VALUE'],
        content: '정말 맛있습니다. 다음에도 방문하고 싶어요.',
        imageFileKeys: ['uploads/reviews/review-1.jpg'],
      }),
    )
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/reviews/5'))
    expect(getReviewEditContext).toHaveBeenCalledTimes(2)
  })

  it('reopens an edited review with the saved content and image', async () => {
    const savedContext = {
      ...reviewEditContextResponse,
      content: '저장 후 다시 연 최신 리뷰입니다.',
      images: [
        {
          fileKey: 'uploads/reviews/saved.jpg',
          imageUrl: 'https://cdn.hashi.kr/saved.jpg',
          displayOrder: 0,
        },
      ],
    }
    let serverContext = reviewEditContextResponse
    vi.mocked(getReviewEditContext).mockImplementation(
      async () => serverContext,
    )
    vi.mocked(updateReview).mockImplementation(async () => {
      serverContext = savedContext
    })
    const { queryClient, unmount } = renderPage()

    const textarea = await screen.findByLabelText('리뷰 내용')
    fireEvent.change(textarea, { target: { value: savedContext.content } })
    fireEvent.click(screen.getByRole('button', { name: '저장하기' }))
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/reviews/5'))

    unmount()
    render(
      <QueryClientProvider client={queryClient}>
        <ReviewEditPage />
      </QueryClientProvider>,
    )

    expect(await screen.findByDisplayValue(savedContext.content)).toBeVisible()
    expect(
      screen.getByRole('img', { name: '기존 리뷰 사진 1 미리보기' }),
    ).toHaveAttribute('src', 'https://cdn.hashi.kr/saved.jpg')
  })

  it('omits a deleted existing image and appends only newly uploaded image keys', async () => {
    vi.mocked(getReviewEditContext).mockResolvedValue({
      ...reviewEditContextResponse,
      images: [
        ...reviewEditContextResponse.images,
        {
          fileKey: 'uploads/reviews/review-2.jpg',
          imageUrl: 'https://cdn.hashi.kr/review-2.jpg',
          displayOrder: 1,
        },
      ],
    })
    vi.mocked(uploadReviewImages).mockResolvedValue([
      'uploads/reviews/review-3.jpg',
    ])
    renderPage()

    await screen.findByDisplayValue(/정말 맛있습니다/)
    fireEvent.click(
      screen.getByRole('button', { name: '기존 리뷰 사진 1 사진 삭제' }),
    )
    const newFile = new File(['image'], 'new.jpg', { type: 'image/jpeg' })
    fireEvent.change(screen.getByLabelText('리뷰 사진 첨부'), {
      target: { files: [newFile] },
    })
    fireEvent.click(screen.getByRole('button', { name: '저장하기' }))

    await waitFor(() =>
      expect(updateReview).toHaveBeenCalledWith(5, {
        rating: 4,
        keywordCodes: ['FOOD_IS_DELICIOUS', 'STAFF_IS_KIND', 'GOOD_VALUE'],
        content: '정말 맛있습니다. 다음에도 방문하고 싶어요.',
        imageFileKeys: [
          'uploads/reviews/review-2.jpg',
          'uploads/reviews/review-3.jpg',
        ],
      }),
    )
    expect(uploadReviewImages).toHaveBeenCalledWith([newFile])
  })

  it('sends an empty image key list when all existing photos are removed', async () => {
    renderPage()

    await screen.findByDisplayValue(/정말 맛있습니다/)
    fireEvent.click(
      screen.getByRole('button', { name: '기존 리뷰 사진 1 사진 삭제' }),
    )
    fireEvent.click(screen.getByRole('button', { name: '저장하기' }))

    await waitFor(() =>
      expect(updateReview).toHaveBeenCalledWith(5, {
        rating: 4,
        keywordCodes: ['FOOD_IS_DELICIOUS', 'STAFF_IS_KIND', 'GOOD_VALUE'],
        content: '정말 맛있습니다. 다음에도 방문하고 싶어요.',
        imageFileKeys: [],
      }),
    )
  })

  it('keeps the draft and shows an error when saving fails', async () => {
    vi.mocked(updateReview).mockRejectedValue(new Error('request failed'))
    renderPage()

    const textarea = await screen.findByLabelText('리뷰 내용')
    fireEvent.change(textarea, { target: { value: '다시 저장할 리뷰입니다.' } })
    fireEvent.click(screen.getByRole('button', { name: '저장하기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '리뷰를 수정하지 못했습니다. 다시 시도해주세요.',
    )
    expect(textarea).toHaveValue('다시 저장할 리뷰입니다.')
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('disables saving while the update request is pending', async () => {
    let finishUpdate: (() => void) | undefined
    vi.mocked(updateReview).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishUpdate = resolve
        }),
    )
    renderPage()

    await screen.findByDisplayValue(/정말 맛있습니다/)
    fireEvent.click(screen.getByRole('button', { name: '저장하기' }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled(),
    )
    expect(updateReview).toHaveBeenCalledTimes(1)
    finishUpdate?.()
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/reviews/5'))
  })

  it('does not overwrite an edited draft when the context query refetches', async () => {
    const { queryClient } = renderPage()

    const textarea = await screen.findByLabelText('리뷰 내용')
    fireEvent.change(textarea, {
      target: { value: '수정 중인 리뷰 본문입니다.' },
    })

    await queryClient.invalidateQueries()

    await waitFor(() => expect(getReviewEditContext).toHaveBeenCalledTimes(2))
    expect(textarea).toHaveValue('수정 중인 리뷰 본문입니다.')
  })

  it('waits for fresh context instead of initializing from stale cache on reentry', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
    })
    queryClient.setQueryData(
      myReviewQueryKeys.editContext(5),
      reviewEditContextResponse,
    )
    await queryClient.invalidateQueries({
      queryKey: myReviewQueryKeys.editContext(5),
      refetchType: 'none',
    })
    const freshContext = {
      ...reviewEditContextResponse,
      content: '저장 후 다시 불러온 최신 리뷰입니다.',
      images: [
        {
          fileKey: 'uploads/reviews/new.jpg',
          imageUrl: 'https://cdn.hashi.kr/new.jpg',
          displayOrder: 0,
        },
      ],
    }
    let resolveFreshContext: ((value: typeof freshContext) => void) | undefined
    vi.mocked(getReviewEditContext).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFreshContext = resolve
        }),
    )

    render(
      <QueryClientProvider client={queryClient}>
        <ReviewEditPage />
      </QueryClientProvider>,
    )

    expect(
      screen.getByText('리뷰 수정 정보를 불러오는 중입니다.'),
    ).toBeVisible()
    expect(
      screen.queryByDisplayValue(reviewEditContextResponse.content),
    ).not.toBeInTheDocument()

    await act(async () => {
      resolveFreshContext?.(freshContext)
    })

    expect(await screen.findByDisplayValue(freshContext.content)).toBeVisible()
    expect(
      screen.getByRole('img', { name: '기존 리뷰 사진 1 미리보기' }),
    ).toHaveAttribute('src', 'https://cdn.hashi.kr/new.jpg')
  })

  it('clears newly selected photos when the review id changes', async () => {
    vi.mocked(getReviewEditContext).mockImplementation(async (reviewId) =>
      reviewId === 6
        ? reviewEditContextResponseForSix
        : reviewEditContextResponse,
    )
    const { queryClient, rerender } = renderPage()

    await screen.findByDisplayValue(/정말 맛있습니다/)
    const photoFile = new File(['image'], 'review-five.png', {
      type: 'image/png',
    })
    fireEvent.change(screen.getByLabelText('리뷰 사진 첨부'), {
      target: { files: [photoFile] },
    })

    expect(
      await screen.findByRole('img', { name: 'review-five.png 미리보기' }),
    ).toBeVisible()

    reviewIdParam.current = '6'
    rerender(
      <QueryClientProvider client={queryClient}>
        <ReviewEditPage />
      </QueryClientProvider>,
    )

    expect(
      await screen.findByDisplayValue('여섯 번째 리뷰의 서버 본문입니다.'),
    ).toBeVisible()
    expect(
      screen.queryByRole('img', { name: 'review-five.png 미리보기' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: '기존 리뷰 사진 1 미리보기' }),
    ).toHaveAttribute('src', 'https://cdn.hashi.kr/review-6.jpg')
  })

  it('shows an invalid route state without requesting edit context', async () => {
    reviewIdParam.current = '0'
    renderPage()

    const backButton = await screen.findByRole('button', {
      name: '마이 리뷰로 돌아가기',
    })

    expect(getReviewEditContext).not.toHaveBeenCalled()
    fireEvent.click(backButton)
    expect(navigateMock).toHaveBeenCalledWith(writtenReviewsLocation)
  })

  it('retries a failed edit context query', async () => {
    vi.mocked(getReviewEditContext)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(reviewEditContextResponse)
    renderPage()

    expect(
      await screen.findByText('리뷰 수정 정보를 불러오지 못했습니다.'),
    ).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByDisplayValue(/정말 맛있습니다/)).toBeVisible()
    expect(getReviewEditContext).toHaveBeenCalledTimes(2)
  })

  it('returns to written reviews when the edit context is not found', async () => {
    vi.mocked(getReviewEditContext).mockRejectedValue(new HttpStatusError(404))
    renderPage()

    expect(
      await screen.findByText('리뷰 수정 정보를 찾을 수 없습니다.'),
    ).toBeVisible()
    fireEvent.click(
      screen.getByRole('button', { name: '마이 리뷰로 돌아가기' }),
    )

    expect(navigateMock).toHaveBeenCalledWith(writtenReviewsLocation)
  })

  it('returns to the previous location from the back button', async () => {
    renderPage()

    await screen.findByDisplayValue(/정말 맛있습니다/)
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(navigateMock).toHaveBeenCalledWith(-1)
  })
})
