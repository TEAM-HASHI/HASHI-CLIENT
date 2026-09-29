import { useState } from 'react'

export const useRestaurantDetailReviewUnavailableModal = () => {
  const [isReviewUnavailableModalOpen, setIsReviewUnavailableModalOpen] =
    useState(false)

  const openReviewUnavailableModal = () => {
    setIsReviewUnavailableModalOpen(true)
  }

  const closeReviewUnavailableModal = () => {
    setIsReviewUnavailableModalOpen(false)
  }

  const resetReviewUnavailableModal = () => {
    setIsReviewUnavailableModalOpen(false)
  }

  return {
    isReviewUnavailableModalOpen,
    onCloseReviewUnavailableModal: closeReviewUnavailableModal,
    onOpenReviewUnavailableModal: openReviewUnavailableModal,
    resetReviewUnavailableModal,
  }
}
