import { useRef, useState } from 'react'
import {
  generatePath,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getRestaurantReviewNewPath } from '@/app/router/routePaths'
import { useCancelReservationMutation } from '@/features/reservation'
import { useMyProfileSummaryQuery } from '@/features/user'
import {
  checkIsReservationStatusFilterValue,
  DEFAULT_RESERVATION_STATUS,
  type ReservationStatusFilterValue,
} from '@/pages/myReservations/constants/reservationStatus'
import { useMyReservationsList } from '@/pages/myReservations/hooks/useMyReservationsList'
import type { VisitedReservation } from '@/pages/myReservations/types'
import { HASHI_KAKAO_CHANNEL_URL } from '@/shared/constants/contact'

const DEFAULT_USER_NAME = '하시'

export const useMyReservationsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const selectedStatus = checkIsReservationStatusFilterValue(statusParam)
    ? statusParam
    : DEFAULT_RESERVATION_STATUS
  const [cancelReservationId, setCancelReservationId] = useState<string | null>(
    null,
  )
  const isCancelRequestLockedRef = useRef(false)
  const profileSummaryQuery = useMyProfileSummaryQuery()
  const cancelReservationMutation = useCancelReservationMutation()
  const reservationList = useMyReservationsList(selectedStatus, location.key)

  const handleStatusChange = (status: ReservationStatusFilterValue) => {
    if (status === selectedStatus) {
      return
    }

    reservationList.resetListScroll()
    setSearchParams({ status })
  }

  const handleContactPress = () => {
    window.open(HASHI_KAKAO_CHANNEL_URL, '_blank', 'noreferrer')
  }

  const handleCancelPress = (reservationId: string) => {
    setCancelReservationId(reservationId)
  }

  const handleCancelDialogOpenChange = (open: boolean) => {
    if (
      !open &&
      !isCancelRequestLockedRef.current &&
      !cancelReservationMutation.isPending
    ) {
      setCancelReservationId(null)
    }
  }

  const handleConfirmCancelPress = async () => {
    if (!cancelReservationId) {
      return
    }

    const reservationId = Number(cancelReservationId)

    if (
      Number.isNaN(reservationId) ||
      isCancelRequestLockedRef.current ||
      cancelReservationMutation.isPending
    ) {
      return
    }

    isCancelRequestLockedRef.current = true

    try {
      await cancelReservationMutation.mutateAsync(reservationId)

      setCancelReservationId(null)
      reservationList.resetListScroll()
      setSearchParams({ status: 'CANCELED' })
    } catch {
      // 실패 toast는 공통 mutation error handler에서 처리합니다.
    } finally {
      isCancelRequestLockedRef.current = false
    }
  }

  const handleDetailPress = (reservationId: string) => {
    reservationList.captureDetailReturn()
    navigate(generatePath(ROUTES.reservationDetail, { reservationId }), {
      state: { fromReservationList: true },
    })
  }

  const handleReviewPress = (reservation: VisitedReservation) => {
    if (reservation.reviewActionState === 'WRITTEN' && reservation.reviewId) {
      navigate(
        generatePath(ROUTES.reviewDetail, { reviewId: reservation.reviewId }),
        {
          state: {
            returnTo: `${ROUTES.myReservations}?status=VISITED`,
          },
        },
      )
      return
    }

    if (
      reservation.reviewActionState !== 'WRITABLE' ||
      !reservation.restaurantId
    ) {
      return
    }

    navigate(
      getRestaurantReviewNewPath(
        reservation.restaurantId,
        reservation.reservationId,
      ),
    )
  }

  const handleEmptyActionPress = () => {
    navigate(ROUTES.popularRestaurants)
  }

  return {
    userName: profileSummaryQuery.data?.nickname ?? DEFAULT_USER_NAME,
    selectedStatus,
    reservations: reservationList.reservations,
    totalCount: reservationList.totalCount,
    error: profileSummaryQuery.error ?? reservationList.error,
    isLoading: reservationList.isLoading,
    hasNextPage: reservationList.hasNextPage,
    isFetchNextPageError: reservationList.isFetchNextPageError,
    isFetchingNextPage: reservationList.isFetchingNextPage,
    isCancelingReservation: cancelReservationMutation.isPending,
    loadMoreRef: reservationList.loadMoreRef,
    listScrollRef: reservationList.listScrollRef,
    isCancelDialogOpen: cancelReservationId !== null,
    handleStatusChange,
    handleCancelPress,
    handleCancelDialogOpenChange,
    handleContactPress,
    handleConfirmCancelPress,
    handleDetailPress,
    handleEmptyActionPress,
    handleReviewPress,
    handleRetryLoadMore: reservationList.handleRetryLoadMore,
  }
}
