import { useEffect, useMemo, useRef, useState } from 'react'

import {
  REVIEW_PAGE_SIZE,
  type ReviewSortValue,
} from '@/features/restaurantDetail/constants/restaurantReview'
import type { RestaurantReview } from '@/features/restaurantDetail/types/restaurantDetail'

export const useRestaurantReviews = (reviews: RestaurantReview[]) => {
  const [selectedSort, setSelectedSort] = useState<ReviewSortValue>('latest')
  const [visibleReviewCount, setVisibleReviewCount] = useState(REVIEW_PAGE_SIZE)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const sortedReviews = useMemo(() => {
    if (selectedSort === 'latest') {
      return reviews
    }

    return [...reviews].sort((firstReview, secondReview) =>
      selectedSort === 'highRating'
        ? secondReview.rating - firstReview.rating
        : firstReview.rating - secondReview.rating,
    )
  }, [reviews, selectedSort])

  const visibleReviews = sortedReviews.slice(0, visibleReviewCount)
  const hasMoreReviews = visibleReviewCount < sortedReviews.length

  const handleSelectSort = (value: ReviewSortValue) => {
    setSelectedSort(value)
    setVisibleReviewCount(REVIEW_PAGE_SIZE)
  }

  useEffect(() => {
    const target = loadMoreRef.current

    if (
      !target ||
      !hasMoreReviews ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return
        }

        setVisibleReviewCount((prevCount) =>
          Math.min(prevCount + REVIEW_PAGE_SIZE, sortedReviews.length),
        )
      },
      {
        root: null,
        rootMargin: '160px',
        threshold: 0,
      },
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [hasMoreReviews, sortedReviews.length])

  return {
    hasMoreReviews,
    loadMoreRef,
    selectedSort,
    visibleReviews,
    onSelectSort: handleSelectSort,
  }
}
