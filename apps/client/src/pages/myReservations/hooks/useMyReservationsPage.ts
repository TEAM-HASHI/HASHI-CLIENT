import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  checkIsReservationStatusFilterValue,
  DEFAULT_RESERVATION_STATUS,
  type ReservationStatusFilterValue,
} from '@/pages/myReservations/constants/reservationStatus'
import { myReservationsMockItems } from '@/pages/myReservations/mocks/myReservations.mock'
import type { VisitedReservation } from '@/pages/myReservations/types'

// TODO: 실제 사용자 이름을 가져오는 로직으로 수정
const MOCK_USER_NAME = '권혁준'

export const useMyReservationsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const selectedStatus = checkIsReservationStatusFilterValue(statusParam)
    ? statusParam
    : DEFAULT_RESERVATION_STATUS
  const [cancelReservationId, setCancelReservationId] = useState<string | null>(
    null,
  )

  const reservations = myReservationsMockItems.filter(
    (reservation) => reservation.status === selectedStatus,
  )

  const handleStatusChange = (status: ReservationStatusFilterValue) => {
    setSearchParams({ status })
    window.scrollTo({ top: 0 })
  }

  const handleContactPress = () => {
    window.open('https://pf.kakao.com/_xgCxkqG', '_blank', 'noreferrer')
  }

  const handleCancelPress = (reservationId: string) => {
    setCancelReservationId(reservationId)
  }

  const handleCancelDialogOpenChange = (open: boolean) => {
    if (!open) {
      setCancelReservationId(null)
    }
  }

  const handleConfirmCancelPress = () => {
    if (!cancelReservationId) {
      return
    }

    // TODO: 예약 취소 API와 성공 Toast 연결
    console.log('confirm cancel reservation', cancelReservationId)
    setCancelReservationId(null)
  }

  const handleDetailPress = (reservationId: string) => {
    navigate(ROUTES.reservationDetail.replace(':reservationId', reservationId))
  }

  const handleReviewPress = (reservation: VisitedReservation) => {
    if (reservation.hasReview && reservation.reviewId) {
      navigate(ROUTES.reviewDetail.replace(':reviewId', reservation.reviewId))
      return
    }

    navigate(
      ROUTES.reviewNew.replace(':restaurantId', reservation.restaurantId),
    )
  }

  const handleEmptyActionPress = () => {
    navigate(ROUTES.popularRestaurants)
  }

  return {
    userName: MOCK_USER_NAME,
    selectedStatus,
    reservations,
    totalCount: reservations.length,
    isCancelDialogOpen: cancelReservationId !== null,
    handleStatusChange,
    handleCancelPress,
    handleCancelDialogOpenChange,
    handleContactPress,
    handleConfirmCancelPress,
    handleDetailPress,
    handleEmptyActionPress,
    handleReviewPress,
  }
}
