import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RestaurantReviewSection } from '@/features/restaurantDetail/components/RestaurantReviewSection'
import { REVIEW_KEYWORDS } from '@/features/review/constants/reviewKeywords'
import type {
  RestaurantRatingDistribution,
  RestaurantReview,
} from '@/features/restaurantDetail/types/restaurantDetail'
import type { ReviewSortValue } from '@/features/restaurantDetail/constants/restaurantReview'

const DEFAULT_RATING_DISTRIBUTION: RestaurantRatingDistribution = {
  five: 8,
  four: 1,
  three: 1,
  two: 0,
  one: 0,
}

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

const renderReviewSection = ({
  hasMoreReviews = false,
  isReviewListLoading = false,
  onSelectSort = vi.fn(),
  ratingDistribution = DEFAULT_RATING_DISTRIBUTION,
  reviewCount = 10,
  reviews = createReviews(1),
  selectedSort = 'latest',
}: {
  hasMoreReviews?: boolean
  isReviewListLoading?: boolean
  onSelectSort?: (sort: ReviewSortValue) => void
  ratingDistribution?: RestaurantRatingDistribution
  reviewCount?: number
  reviews?: RestaurantReview[]
  selectedSort?: ReviewSortValue
} = {}) =>
  render(
    <RestaurantReviewSection
      hasMoreReviews={hasMoreReviews}
      isReviewListLoading={isReviewListLoading}
      loadMoreRef={createRef<HTMLDivElement>()}
      onPressReviewImage={vi.fn()}
      onPressWriteReview={vi.fn()}
      onSelectSort={onSelectSort}
      rating={3.8}
      ratingDistribution={ratingDistribution}
      restaurantName="야키니쿠 리키마루"
      reviewCount={reviewCount}
      reviews={reviews}
      selectedSort={selectedSort}
    />,
  )

describe('RestaurantReviewSection', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders server-provided reviews and delegates sort changes', () => {
    const handleSelectSort = vi.fn()

    renderReviewSection({
      hasMoreReviews: true,
      onSelectSort: handleSelectSort,
      reviewCount: 25,
      reviews: createReviews(25),
    })

    expect(screen.getAllByText('혁줌마')).toHaveLength(25)
    expect(screen.getByText('야키니쿠 리키마루')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '높은 평점 순' }))

    expect(handleSelectSort).toHaveBeenCalledWith('rating-high')
  })

  it('renders a load-more sentinel only when more reviews exist', () => {
    const { rerender } = render(
      <RestaurantReviewSection
        hasMoreReviews={false}
        isReviewListLoading={false}
        loadMoreRef={createRef<HTMLDivElement>()}
        onPressReviewImage={vi.fn()}
        onPressWriteReview={vi.fn()}
        onSelectSort={vi.fn()}
        rating={3.8}
        ratingDistribution={DEFAULT_RATING_DISTRIBUTION}
        restaurantName="야키니쿠 리키마루"
        reviewCount={10}
        reviews={createReviews(10)}
        selectedSort="latest"
      />,
    )

    expect(screen.getAllByText('혁줌마')).toHaveLength(10)
    expect(screen.queryByTestId('restaurant-review-load-more')).toBeNull()

    rerender(
      <RestaurantReviewSection
        hasMoreReviews
        isReviewListLoading={false}
        loadMoreRef={createRef<HTMLDivElement>()}
        onPressReviewImage={vi.fn()}
        onPressWriteReview={vi.fn()}
        onSelectSort={vi.fn()}
        rating={3.8}
        ratingDistribution={DEFAULT_RATING_DISTRIBUTION}
        restaurantName="야키니쿠 리키마루"
        reviewCount={10}
        reviews={createReviews(10)}
        selectedSort="latest"
      />,
    )

    expect(
      screen.getByTestId('restaurant-review-load-more'),
    ).toBeInTheDocument()
  })

  it('renders only review list skeleton while review list is loading', () => {
    const { container } = renderReviewSection({
      isReviewListLoading: true,
      reviews: createReviews(10),
    })

    expect(
      screen.getByRole('status', { name: '리뷰 목록 로딩 중' }),
    ).toBeTruthy()
    expect(screen.queryByText('혁줌마')).not.toBeInTheDocument()
    expect(screen.queryByTestId('restaurant-review-load-more')).toBeNull()
    expect(screen.getByRole('button', { name: '최신순' })).toBeInTheDocument()
    expect(
      container.querySelectorAll('.bg-secondary-200').length,
    ).toBeGreaterThan(0)
  })

  it('renders empty state when reviews are empty', () => {
    renderReviewSection({
      reviewCount: 0,
      reviews: [],
    })

    expect(screen.getByText('리뷰 리스트를 준비중이에요.')).toBeInTheDocument()
    expect(screen.queryByTestId('restaurant-review-load-more')).toBeNull()
  })

  it('renders rating distribution bars from server-provided counts', () => {
    renderReviewSection({
      reviewCount: 5,
      ratingDistribution: { five: 4, four: 1, three: 0, two: 0, one: 0 },
    })

    expect(screen.getByLabelText('5점 리뷰 4개')).toBeInTheDocument()
    expect(screen.getByLabelText('4점 리뷰 1개')).toBeInTheDocument()

    const fiveStarBar = screen
      .getByLabelText('5점 리뷰 4개')
      .querySelector('.bg-primary-400')
    const fourStarBar = screen
      .getByLabelText('4점 리뷰 1개')
      .querySelector('.bg-primary-400')
    const threeStarBar = screen
      .getByLabelText('3점 리뷰 0개')
      .querySelector('.bg-primary-400')

    expect(fiveStarBar).toHaveStyle({
      '--restaurant-rating-distribution-scale': '0.8',
    })
    expect(fourStarBar).toHaveStyle({
      '--restaurant-rating-distribution-scale': '0.2',
    })
    expect(threeStarBar).toHaveStyle({
      '--restaurant-rating-distribution-scale': '0',
    })
  })

  it('renders default image when review image fails to load', () => {
    renderReviewSection({
      reviews: [
        {
          ...createReviews(1)[0],
          images: ['https://example.com/review.webp'],
        },
      ],
    })

    expect(screen.queryByTestId('restaurant-review-default-image')).toBeNull()

    const reviewImage = screen
      .getByRole('button', { name: '리뷰 이미지 1' })
      .querySelector('img')
    expect(reviewImage).toBeInTheDocument()

    fireEvent.error(reviewImage as HTMLImageElement)

    expect(
      screen.getByTestId('restaurant-review-default-image'),
    ).toBeInTheDocument()
  })

  it('renders default image when reviewer profile image is empty', () => {
    renderReviewSection()

    expect(
      screen.getByTestId('restaurant-review-profile-default-image'),
    ).toBeInTheDocument()
  })

  it('renders default image when reviewer profile image fails to load', () => {
    renderReviewSection({
      reviews: [
        {
          ...createReviews(1)[0],
          reviewerProfileImageUrl: 'https://example.com/profile.webp',
        },
      ],
    })

    expect(
      screen.queryByTestId('restaurant-review-profile-default-image'),
    ).toBeNull()

    const profileImage = screen
      .getByText('혁줌마')
      .parentElement?.querySelector('img')
    expect(profileImage).toBeInTheDocument()

    fireEvent.error(profileImage as HTMLImageElement)

    expect(
      screen.getByTestId('restaurant-review-profile-default-image'),
    ).toBeInTheDocument()
  })

  it('renders icons for every supported review keyword', () => {
    const { container } = renderReviewSection({
      reviews: [
        {
          ...createReviews(1)[0],
          keywords: REVIEW_KEYWORDS.map((keyword) => keyword.label),
        },
      ],
    })

    const keywordList = screen.getByText(REVIEW_KEYWORDS[0].label).parentElement
      ?.parentElement

    expect(keywordList?.querySelectorAll('svg')).toHaveLength(
      REVIEW_KEYWORDS.length,
    )
    expect(container).toBeTruthy()
  })

  it('styles compact review ratings from the app layer', () => {
    renderReviewSection()

    expect(screen.getAllByRole('img', { name: '평점 3.8점' })[0]).toHaveClass(
      '[&&]:gap-0',
      '[&_[data-state=filled]_svg]:text-primary-400',
      '[&_[data-state=half]_span_svg]:text-primary-400',
    )
  })

  it('styles the review write icon from the app layer', () => {
    renderReviewSection()

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
    renderReviewSection()

    expect(screen.getByRole('button', { name: '리뷰 작성하기' })).toHaveClass(
      'bg-cool-gray-600',
    )
  })

  it('keeps the review list 16px below the write-review CTA', () => {
    renderReviewSection()

    const reviewListWrapper = screen.getByRole('heading', {
      name: '리뷰 10',
    }).parentElement?.parentElement

    expect(reviewListWrapper).toHaveClass('pt-4')
  })

  it('keeps the write-review button inset 16px from the CTA sides', () => {
    renderReviewSection()

    const reviewButtonContent = screen.getByText('리뷰 작성하기').parentElement
    const reviewCta = reviewButtonContent?.parentElement?.parentElement

    expect(reviewCta).toHaveClass('px-4')
  })
})
