import '@testing-library/jest-dom/vitest'
import { ToastRegion, toastQueue } from '@hashi/hds-ui'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { createRef } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RestaurantReviewSection } from '@/features/restaurantDetail/components/RestaurantReviewSection'
import { ReviewModerationContext } from '@/features/restaurantDetail/reviewModeration'
import { ReviewReportPage } from '@/pages/reviewReport/ReviewReportPage'

const { auth } = vi.hoisted(() => ({ auth: { isAuthenticated: true } }))

vi.mock('@/shared/hooks/useAuthStatus', () => ({
  useAuthStatus: () => auth,
}))

const renderFlow = (status: 'available' | 'reported' | 'own' = 'available') => {
  let reviewStatus: 'available' | 'reported' | 'own' | 'blocked' = status
  const blockReviewer = vi.fn(async () => {
    reviewStatus = 'blocked'
  })
  const reportReview = vi.fn(async () => {
    reviewStatus = 'reported'
    return 'submitted' as const
  })

  const { container } = render(
    <ReviewModerationContext.Provider
      value={{
        getReviewStatus: () => reviewStatus,
        blockReviewer,
        reportReview,
      }}
    >
      <MemoryRouter initialEntries={['/restaurants/9']}>
        <Routes>
          <Route
            path="/restaurants/:restaurantId"
            element={
              <RestaurantReviewSection
                restaurantName="테스트 식당"
                rating={3.8}
                reviewCount={1}
                ratingDistribution={{
                  five: 1,
                  four: 0,
                  three: 0,
                  two: 0,
                  one: 0,
                }}
                reviews={[
                  {
                    id: '1',
                    reviewerName: '리뷰 작성자',
                    rating: 5,
                    date: '2026.11.19',
                    content: '테스트 리뷰',
                    images: [],
                    keywords: [],
                  },
                ]}
                hasMoreReviews={false}
                isReviewListLoading={false}
                loadMoreRef={createRef()}
                selectedSort="latest"
                onPressReviewImage={vi.fn()}
                onPressWriteReview={vi.fn()}
                onSelectSort={vi.fn()}
              />
            }
          />
          <Route
            path="/reviews/:reviewId/report"
            element={<ReviewReportPage />}
          />
        </Routes>
      </MemoryRouter>
      <ToastRegion />
    </ReviewModerationContext.Provider>,
  )

  container.setAttribute('data-page-scroll', '')
  return { blockReviewer, reportReview, container }
}

const chooseReviewAction = (action: '차단하기' | '신고하기') => {
  fireEvent.click(
    screen.getByRole('button', { name: '리뷰 작성자 리뷰 더보기' }),
  )
  fireEvent.click(screen.getByRole('button', { name: action }))
}

afterEach(() => {
  cleanup()
  toastQueue.clear()
  auth.isAuthenticated = true
})

describe('리뷰 차단·신고', () => {
  it.each([
    ['아래', 340, 'top-full'],
    ['위', 650, 'bottom-full'],
  ] as const)('더보기 메뉴를 %s에 표시한다', (_side, triggerTop, position) => {
    const { container } = renderFlow()
    const trigger = screen.getByRole('button', {
      name: '리뷰 작성자 리뷰 더보기',
    })
    const getRect = HTMLElement.prototype.getBoundingClientRect
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this === container) return new DOMRect(0, 0, 393, 700)
        if (this === trigger) return new DOMRect(341, triggerTop, 32, 32)
        if (this.id && this.id === trigger.getAttribute('aria-controls'))
          return new DOMRect(231, triggerTop + 32, 142, 82)
        return getRect.call(this)
      })
    try {
      fireEvent.click(trigger)
      expect(
        screen.getByRole('button', { name: '신고하기' }).parentElement,
      ).toHaveClass(position)
    } finally {
      rect.mockRestore()
    }
  })

  it('차단 취소 후 목록을 유지하고, 성공 후 작성자 리뷰를 숨긴다', async () => {
    const { blockReviewer } = renderFlow()
    chooseReviewAction('차단하기')
    expect(screen.getByRole('dialog')).toHaveTextContent(
      '차단 후에는 해제할 수 없습니다.',
    )
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '돌아가기',
      }),
    )
    expect(blockReviewer).not.toHaveBeenCalled()
    expect(screen.getByText('테스트 리뷰')).toBeInTheDocument()

    chooseReviewAction('차단하기')
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '차단하기',
      }),
    )
    await screen.findByText('작성된 리뷰가 없습니다.')
    expect(blockReviewer).toHaveBeenCalledExactlyOnceWith('1')
  })

  it('본인 리뷰에는 관리 메뉴를 표시하지 않는다', () => {
    renderFlow('own')
    expect(
      screen.queryByRole('button', { name: '리뷰 작성자 리뷰 더보기' }),
    ).not.toBeInTheDocument()
  })

  it('비회원의 신고 선택은 로그인 바텀시트를 연다', async () => {
    auth.isAuthenticated = false
    const { reportReview } = renderFlow()
    chooseReviewAction('신고하기')
    expect(
      await screen.findByRole('dialog', { name: '로그인 안내' }),
    ).toBeVisible()
    expect(reportReview).not.toHaveBeenCalled()
  })

  it('신고 상세 입력창은 내용에 맞게 최대 세 줄까지 커지고 비우면 원래 높이로 돌아온다', () => {
    renderFlow()
    chooseReviewAction('신고하기')
    const details = screen.getByRole('textbox', {
      name: '상세 내용',
    }) as HTMLTextAreaElement
    // jsdom does not measure native textarea rows.
    Object.defineProperties(details, {
      offsetHeight: { get: () => 34 + details.rows * 19 },
      clientHeight: { get: () => 32 + details.rows * 19 },
      scrollHeight: { get: () => 32 + details.value.split('\n').length * 19 },
    })

    expect(details).toHaveAttribute('rows', '1')
    expect(details.style.height).toBe('')
    fireEvent.change(details, { target: { value: '첫 줄\n둘째 줄' } })
    expect(details.style.height).toBe('72px')
    fireEvent.change(details, {
      target: { value: '첫 줄\n둘째 줄\n셋째 줄\n넷째 줄' },
    })
    expect(details.style.height).toBe('91px')
    fireEvent.change(details, { target: { value: '한 줄' } })
    expect(details.style.height).toBe('53px')
    fireEvent.change(details, { target: { value: '' } })
    expect(details.style.height).toBe('')
  })

  it('신고 사유와 최대 1000자를 검증하고, 취소·실패 후 입력을 보존한다', async () => {
    const { reportReview } = renderFlow()
    reportReview.mockRejectedValueOnce(new Error('network'))
    chooseReviewAction('신고하기')
    const submit = await screen.findByRole('button', { name: '신고하기' })
    expect(submit).toBeDisabled()
    expect(screen.getAllByRole('radio')).toHaveLength(7)
    fireEvent.click(screen.getByRole('radio', { name: '다른 매장 리뷰' }))
    const details = screen.getByRole('textbox', { name: '상세 내용' })
    expect(details).toHaveAttribute(
      'placeholder',
      '신고 사유를 자세히 작성해 주세요.',
    )
    fireEvent.change(details, { target: { value: '가'.repeat(1001) } })
    expect(details).toHaveValue('가'.repeat(1000))
    expect(screen.getByText('최대 1000자까지 입력할 수 있어요.')).toBeVisible()
    fireEvent.click(submit)
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '돌아가기',
      }),
    )
    expect(reportReview).not.toHaveBeenCalled()
    expect(details).toHaveValue('가'.repeat(1000))

    fireEvent.click(submit)
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '신고하기',
      }),
    )
    expect(await screen.findByText('신고를 접수하지 못했어요.')).toBeVisible()
    toastQueue.clear()
    expect(details).toHaveValue('가'.repeat(1000))
    expect(screen.getByRole('radio', { name: '다른 매장 리뷰' })).toBeChecked()
    fireEvent.click(submit)
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '신고하기',
      }),
    )
    expect(await screen.findByText('테스트 리뷰')).toBeInTheDocument()
    expect(
      await screen.findByText('신고가 정상적으로 접수되었어요.'),
    ).toBeVisible()
    toastQueue.clear()
    chooseReviewAction('신고하기')
    expect(await screen.findByText('이미 신고한 리뷰예요.')).toBeVisible()
    expect(
      screen.queryByRole('group', { name: /신고 사유/ }),
    ).not.toBeInTheDocument()
    expect(reportReview).toHaveBeenCalledTimes(2)
  })
})
