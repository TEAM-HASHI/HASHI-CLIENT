import { useState } from 'react'

interface OpenReviewImageViewerParams {
  imageUrls: string[]
  initialIndex: number
}

export const useRestaurantDetailReviewImageViewer = () => {
  const [isReviewImageViewerOpen, setIsReviewImageViewerOpen] = useState(false)
  const [reviewImageViewerImageUrls, setReviewImageViewerImageUrls] = useState<
    string[]
  >([])
  const [reviewImageViewerInitialIndex, setReviewImageViewerInitialIndex] =
    useState(0)

  const openReviewImageViewer = ({
    imageUrls,
    initialIndex,
  }: OpenReviewImageViewerParams) => {
    setReviewImageViewerImageUrls(imageUrls)
    setReviewImageViewerInitialIndex(initialIndex)
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
