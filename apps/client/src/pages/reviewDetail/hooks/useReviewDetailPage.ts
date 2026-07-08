import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getReviewDetailMock } from '@/pages/reviewDetail/mocks/reviewDetail.mock'

export const useReviewDetailPage = () => {
  const navigate = useNavigate()
  const { reviewId } = useParams()
  const reviewDetail = getReviewDetailMock(reviewId)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditComingSoonDialogOpen, setIsEditComingSoonDialogOpen] =
    useState(false)

  const handleBackClick = () => {
    navigate(ROUTES.myReviews)
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setIsDeleteDialogOpen(open)
  }

  const handleConfirmDeleteClick = () => {
    // TODO: 리뷰 삭제 API와 성공 Toast 연결
    setIsDeleteDialogOpen(false)
    navigate(ROUTES.myReviews)
  }

  const handleEditClick = () => {
    setIsEditComingSoonDialogOpen(true)
  }

  const handleEditComingSoonDialogOpenChange = (open: boolean) => {
    setIsEditComingSoonDialogOpen(open)
  }

  return {
    isDeleteDialogOpen,
    isEditComingSoonDialogOpen,
    reviewDetail,
    handleBackClick,
    handleConfirmDeleteClick,
    handleDeleteClick,
    handleDeleteDialogOpenChange,
    handleEditClick,
    handleEditComingSoonDialogOpenChange,
  }
}
