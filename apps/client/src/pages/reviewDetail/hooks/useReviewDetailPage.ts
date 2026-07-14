import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { useDeleteReviewMutation } from '@/features/review/mutations/useDeleteReviewMutation'
import { useReviewDetailQuery } from '@/pages/reviewDetail/queries/useReviewDetailQuery'
import { toReviewDetail } from '@/pages/reviewDetail/utils/reviewDetailViewModel'

const parseReviewId = (value: string | undefined) => {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return null
  }

  const reviewId = Number(value)

  return Number.isSafeInteger(reviewId) ? reviewId : null
}

const WRITTEN_REVIEWS_LOCATION = {
  pathname: ROUTES.myReviews,
  search: '?tab=written',
}

export const useReviewDetailPage = () => {
  const navigate = useNavigate()
  const { reviewId } = useParams()
  const validReviewId = parseReviewId(reviewId)
  const reviewDetailQuery = useReviewDetailQuery(validReviewId)
  const deleteReviewMutation = useDeleteReviewMutation()
  const reviewDetail = useMemo(
    () =>
      reviewDetailQuery.data
        ? toReviewDetail(reviewDetailQuery.data)
        : undefined,
    [reviewDetailQuery.data],
  )
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditComingSoonDialogOpen, setIsEditComingSoonDialogOpen] =
    useState(false)

  const handleBackClick = () => {
    navigate(WRITTEN_REVIEWS_LOCATION)
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setIsDeleteDialogOpen(open)
  }

  const handleConfirmDeleteClick = async () => {
    if (validReviewId === null) {
      return
    }

    try {
      await deleteReviewMutation.mutateAsync(validReviewId)
      setIsDeleteDialogOpen(false)
      navigate(WRITTEN_REVIEWS_LOCATION)
    } catch {
      // The shared mutation error policy presents the failure to the user.
    }
  }

  const handleEditClick = () => {
    setIsEditComingSoonDialogOpen(true)
  }

  const handleEditComingSoonDialogOpenChange = (open: boolean) => {
    setIsEditComingSoonDialogOpen(open)
  }

  const handleRetryClick = () => {
    void reviewDetailQuery.refetch()
  }

  return {
    isError: validReviewId === null || reviewDetailQuery.isError,
    isDeleteDialogOpen,
    isDeletePending: deleteReviewMutation.isPending,
    isEditComingSoonDialogOpen,
    isInvalidReviewId: validReviewId === null,
    isPending: validReviewId !== null && reviewDetailQuery.isPending,
    reviewDetail,
    handleBackClick,
    handleConfirmDeleteClick,
    handleDeleteClick,
    handleDeleteDialogOpenChange,
    handleEditClick,
    handleEditComingSoonDialogOpenChange,
    handleRetryClick,
  }
}
