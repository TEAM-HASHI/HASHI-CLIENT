import '@testing-library/jest-dom/vitest'

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { REVIEW_PHOTO_MAX_COUNT } from '@/features/review/constants'
import { ReviewDetailContentCard } from '@/pages/reviewDetail/components/ReviewDetailContentCard'
import { ReviewDetailPage } from '@/pages/reviewDetail/ReviewDetailPage'

const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ reviewId: 'review-1' }),
}))

afterEach(() => {
  cleanup()
  navigateMock.mockClear()
  vi.restoreAllMocks()
})

describe('ReviewDetailPage', () => {
  it('renders review detail contents from the review detail mock', () => {
    render(<ReviewDetailPage />)

    expect(screen.getByText('리뷰 상세')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: '리뷰 대상 예약 정보' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        '야키토리 무사시 제목은 여기까지 그러나 최대길이 이 정도로까지',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('2026. 6. 22 17:00 방문')).toBeInTheDocument()
    expect(screen.getByText('어른 2명')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '평점 4점' })).toBeInTheDocument()
    expect(screen.getByText('2026.06.28')).toBeInTheDocument()
    expect(
      screen.getByRole('list', { name: '리뷰 이미지 목록' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('list', { name: '선택한 리뷰 키워드' }),
    ).toBeInTheDocument()
    expect(screen.getByText('친절해요')).toBeInTheDocument()
    expect(screen.getByText('음식이 빨리 나와요')).toBeInTheDocument()
    expect(screen.getByText('가성비가 좋아요')).toBeInTheDocument()
  })

  it('expands and collapses the review body when the more button is clicked', () => {
    const getComputedStyle = window.getComputedStyle.bind(window)

    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      const style = getComputedStyle(element)

      Object.defineProperty(style, 'fontSize', {
        configurable: true,
        value: '16px',
      })
      Object.defineProperty(style, 'lineHeight', {
        configurable: true,
        value: '24px',
      })

      return style
    })
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(120)

    render(<ReviewDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: /더보기/ }))

    expect(screen.getByRole('button', { name: /접기/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /접기/ }))

    expect(screen.getByRole('button', { name: /더보기/ })).toBeInTheDocument()
  })

  it('moves to my reviews when the back button is clicked', () => {
    render(<ReviewDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(navigateMock).toHaveBeenCalledWith(ROUTES.myReviews)
  })

  it('opens the delete confirmation dialog and closes it from cancel', () => {
    render(<ReviewDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '삭제하기' }))

    const dialog = screen.getByRole('alertdialog', {
      name: '리뷰 삭제 확인',
    })

    expect(
      within(dialog).getByText('정말 삭제하시겠습니까?'),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText('삭제한 리뷰는 다시 되돌릴 수 없어요.'),
    ).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: '취소하기' }))

    expect(
      screen.queryByRole('alertdialog', { name: '리뷰 삭제 확인' }),
    ).not.toBeInTheDocument()
  })

  it('moves to my reviews after confirming delete', () => {
    render(<ReviewDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '삭제하기' }))

    const dialog = screen.getByRole('alertdialog', {
      name: '리뷰 삭제 확인',
    })

    fireEvent.click(within(dialog).getByRole('button', { name: '삭제하기' }))

    expect(navigateMock).toHaveBeenCalledWith(ROUTES.myReviews)
  })

  it('opens the coming soon dialog from the MVP excluded edit button', () => {
    render(<ReviewDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '수정하기' }))

    expect(screen.getByText('서비스를 준비하고 있어요.')).toBeInTheDocument()
    expect(
      screen.getByText((_, element) => {
        return (
          element?.textContent ===
          '더 편한 Hashi 이용을 위해현재 기능을 준비하고 있어요.'
        )
      }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '확인' }))

    expect(
      screen.queryByText('서비스를 준비하고 있어요.'),
    ).not.toBeInTheDocument()
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
