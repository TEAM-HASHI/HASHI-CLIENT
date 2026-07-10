import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RestaurantReviewSection } from '@/features/restaurantDetail/components/RestaurantReviewSection'
import type { RestaurantReview } from '@/features/restaurantDetail/types/restaurantDetail'

const createReviews = (count: number): RestaurantReview[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `review-${index + 1}`,
    reviewerName: '혁줌마',
    rating: (index % 5) + 1,
    date: '2026.06.28',
    content:
      '정말 맛있습니다 와우!!! 정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!',
    images: ['', '', ''],
    keywords: ['친절해요', '음식이 빨리 나와요', '가성비가 좋아요'],
  }))

describe('RestaurantReviewSection', () => {
  let handleIntersection: IntersectionObserverCallback
  const observe = vi.fn()
  const disconnect = vi.fn()

  beforeEach(() => {
    observe.mockClear()
    disconnect.mockClear()

    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn((callback: IntersectionObserverCallback) => {
        handleIntersection = callback

        return {
          disconnect,
          observe,
          root: null,
          rootMargin: '',
          thresholds: [],
          takeRecords: () => [],
          unobserve: vi.fn(),
        } satisfies IntersectionObserver
      }),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders reviews in 10 item pages and resets when sort changes', () => {
    render(
      <RestaurantReviewSection
        onPressReviewImage={vi.fn()}
        onPressWriteReview={vi.fn()}
        rating={3.8}
        restaurantName="야키니쿠 리키마루"
        reviewCount={256}
        reviews={createReviews(25)}
      />,
    )

    expect(screen.getAllByText('혁줌마')).toHaveLength(10)
    expect(screen.getByText('야키니쿠 리키마루')).toBeInTheDocument()
    expect(observe).toHaveBeenCalled()

    act(() => {
      handleIntersection(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(screen.getAllByText('혁줌마')).toHaveLength(20)

    fireEvent.click(screen.getByRole('button', { name: '높은 평점 순' }))

    expect(screen.getAllByText('혁줌마')).toHaveLength(10)
    expect(screen.getAllByRole('img', { name: '평점 5점' })).toHaveLength(5)
  })

  it('does not render a load-more sentinel when there are 10 or fewer reviews', () => {
    render(
      <RestaurantReviewSection
        onPressReviewImage={vi.fn()}
        onPressWriteReview={vi.fn()}
        rating={3.8}
        restaurantName="야키니쿠 리키마루"
        reviewCount={10}
        reviews={createReviews(10)}
      />,
    )

    expect(screen.getAllByText('혁줌마')).toHaveLength(10)
    expect(observe).not.toHaveBeenCalled()
  })

  it('styles compact review ratings from the app layer', () => {
    render(
      <RestaurantReviewSection
        onPressReviewImage={vi.fn()}
        onPressWriteReview={vi.fn()}
        rating={3.8}
        restaurantName="야키니쿠 리키마루"
        reviewCount={10}
        reviews={createReviews(1)}
      />,
    )

    expect(screen.getAllByRole('img', { name: '평점 3.8점' })[0]).toHaveClass(
      '[&&]:gap-0',
      '[&_[data-state=filled]_svg]:text-primary-400',
      '[&_[data-state=half]_span_svg]:text-primary-400',
    )
  })

  it('styles the review write icon from the app layer', () => {
    render(
      <RestaurantReviewSection
        onPressReviewImage={vi.fn()}
        onPressWriteReview={vi.fn()}
        rating={3.8}
        restaurantName="야키니쿠 리키마루"
        reviewCount={10}
        reviews={createReviews(1)}
      />,
    )

    expect(
      screen
        .getByRole('button', { name: '리뷰 작성하기' })
        .querySelector('svg'),
    ).toHaveClass(
      'size-6',
      '[&_path:first-child]:fill-primary-100',
      '[&_path:last-child]:stroke-primary-100',
    )
  })

  it('uses cool gray 600 for the write-review CTA background', () => {
    render(
      <RestaurantReviewSection
        onPressReviewImage={vi.fn()}
        onPressWriteReview={vi.fn()}
        rating={3.8}
        restaurantName="야키니쿠 리키마루"
        reviewCount={10}
        reviews={createReviews(1)}
      />,
    )

    expect(screen.getByRole('button', { name: '리뷰 작성하기' })).toHaveClass(
      'bg-cool-gray-600',
    )
  })

  it('keeps the review list 16px below the write-review CTA', () => {
    render(
      <RestaurantReviewSection
        onPressReviewImage={vi.fn()}
        onPressWriteReview={vi.fn()}
        rating={3.8}
        restaurantName="야키니쿠 리키마루"
        reviewCount={10}
        reviews={createReviews(1)}
      />,
    )

    const reviewListWrapper = screen.getByRole('heading', {
      name: '리뷰 10',
    }).parentElement?.parentElement

    expect(reviewListWrapper).toHaveClass('pt-4')
  })

  it('keeps the write-review button inset 16px from the CTA sides', () => {
    render(
      <RestaurantReviewSection
        onPressReviewImage={vi.fn()}
        onPressWriteReview={vi.fn()}
        rating={3.8}
        restaurantName="야키니쿠 리키마루"
        reviewCount={10}
        reviews={createReviews(1)}
      />,
    )

    const reviewButtonContent = screen.getByText('리뷰 작성하기').parentElement
    const reviewCta = reviewButtonContent?.parentElement?.parentElement

    expect(reviewCta).toHaveClass('px-4')
  })
})
