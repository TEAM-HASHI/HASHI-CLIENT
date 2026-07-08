import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getReviewDetailMock } from '@/pages/reviewDetail/mocks/reviewDetail.mock'

export const useReviewDetailPage = () => {
  const navigate = useNavigate()
  const { reviewId } = useParams()
  const reviewDetail = getReviewDetailMock(reviewId)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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
    // TODO: 공통 ComingSoonDialog PR 머지 후 리뷰 수정 MVP 제외 안내 연결
  }

  return {
    isDeleteDialogOpen,
    reviewDetail,
    handleBackClick,
    handleConfirmDeleteClick,
    handleDeleteClick,
    handleDeleteDialogOpenChange,
    handleEditClick,
  }
}
