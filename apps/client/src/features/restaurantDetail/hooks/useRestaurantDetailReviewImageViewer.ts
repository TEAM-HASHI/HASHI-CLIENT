import { useState } from 'react'

import type { RestaurantDetail } from '@/features/restaurantDetail/types/restaurantDetail'

interface OpenReviewImageViewerParams {
  imageIndex: number
  restaurant: RestaurantDetail | null
  reviewId: string
}

export const useRestaurantDetailReviewImageViewer = () => {
  const [isReviewImageViewerOpen, setIsReviewImageViewerOpen] = useState(false)
  const [reviewImageViewerImageUrls, setReviewImageViewerImageUrls] = useState<
    string[]
  >([])
  const [reviewImageViewerInitialIndex, setReviewImageViewerInitialIndex] =
    useState(0)

  const openReviewImageViewer = ({
    imageIndex,
    restaurant,
    reviewId,
  }: OpenReviewImageViewerParams) => {
    const selectedReview = restaurant?.reviews.find(
      (review) => review.id === reviewId,
    )

    setReviewImageViewerImageUrls(selectedReview?.images ?? [])
    setReviewImageViewerInitialIndex(imageIndex)
    setIsReviewImageViewerOpen(true)
  }

  const closeReviewImageViewer = () => {
    setIsReviewImageViewerOpen(false)
  }

  const resetReviewImageViewer = () => {
    setIsReviewImageViewerOpen(false)
    setReviewImageViewerImageUrls([])
    setReviewImageViewerInitialIndex(0)
  }

  return {
    isReviewImageViewerOpen,
    onCloseReviewImageViewer: closeReviewImageViewer,
    onOpenReviewImageViewer: openReviewImageViewer,
    resetReviewImageViewer,
    reviewImageViewerImageUrls,
    reviewImageViewerInitialIndex,
  }
}
