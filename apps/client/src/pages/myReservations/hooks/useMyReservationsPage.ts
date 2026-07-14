import { useEffect, useMemo, useRef, useState } from 'react'
import { showToast } from '@hashi/hds-ui'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  type MyReservationsApiStatus,
  syncCanceledReservationCache,
  useCancelReservationMutation,
  useMyReservationsInfiniteQuery,
} from '@/features/reservation'
import { useVisitedReservationsInfiniteQuery } from '@/features/review/queries/visitedReservations'
import { useMyProfileSummaryQuery } from '@/features/user'
import {
  checkIsReservationStatusFilterValue,
  DEFAULT_RESERVATION_STATUS,
  type ReservationStatusFilterValue,
} from '@/pages/myReservations/constants/reservationStatus'
import type {
  MyReservation,
  VisitedReservation,
} from '@/pages/myReservations/types'
import {
  createMyReservationViewModel,
  createMyVisitedReservationViewModel,
} from '@/pages/myReservations/utils/createMyReservationViewModel'
import { HASHI_KAKAO_CHANNEL_URL } from '@/shared/constants/contact'
import { useInfiniteScrollTrigger } from '@/shared/hooks'

const DEFAULT_USER_NAME = '하시'

const getMyReservationsApiStatus = (
  status: ReservationStatusFilterValue,
): MyReservationsApiStatus | null => {
  if (status === 'VISITED') {
    return null
  }

  return status
}

const checkIsVisibleReservation = (
  status: ReservationStatusFilterValue,
  reservation: ReturnType<typeof createMyReservationViewModel>,
): reservation is MyReservation => {
  return reservation !== null && reservation.status === status
}

export const useMyReservationsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const selectedStatus = checkIsReservationStatusFilterValue(statusParam)
    ? statusParam
    : DEFAULT_RESERVATION_STATUS
  const [cancelReservationId, setCancelReservationId] = useState<string | null>(
    null,
  )
  const isCancelRequestLockedRef = useRef(false)
  const lastNextPageErrorUpdatedAtRef = useRef(0)
  const apiStatus = getMyReservationsApiStatus(selectedStatus)
  const profileSummaryQuery = useMyProfileSummaryQuery()
  const cancelReservationMutation = useCancelReservationMutation()
  const reservationsQuery = useMyReservationsInfiniteQuery({
    status: apiStatus,
  })
  const visitedReservationsQuery = useVisitedReservationsInfiniteQuery(
    { reviewStatus: 'all', size: 10 },
    selectedStatus === 'VISITED',
  )

  const reservations = useMemo(() => {
    if (selectedStatus === 'VISITED') {
      return (
        visitedReservationsQuery.data?.pages
          .flatMap((page) => page.content ?? [])
          .map(createMyVisitedReservationViewModel)
          .filter((reservation): reservation is MyReservation => {
            return reservation !== null
          }) ?? []
      )
    }

    return (
      reservationsQuery.data?.pages
        .flatMap((page) => page.reservations ?? [])
        .map(createMyReservationViewModel)
        .filter((reservation) =>
          checkIsVisibleReservation(selectedStatus, reservation),
        ) ?? []
    )
  }, [
    reservationsQuery.data?.pages,
    selectedStatus,
    visitedReservationsQuery.data?.pages,
  ])

  const activeReservationsQuery =
    selectedStatus === 'VISITED' ? visitedReservationsQuery : reservationsQuery
  const activeInitialLoadError =
    activeReservationsQuery.isError &&
    reservations.length === 0 &&
    !activeReservationsQuery.isPending
      ? activeReservationsQuery.error
      : null
  const totalCount =
    selectedStatus === 'VISITED'
      ? (visitedReservationsQuery.data?.pages[0]?.totalCount ??
        reservations.length)
      : (reservationsQuery.data?.pages[0]?.totalCount ?? reservations.length)

  useEffect(() => {
    if (
      !activeReservationsQuery.isFetchNextPageError ||
      !activeReservationsQuery.error ||
      activeReservationsQuery.errorUpdatedAt ===
        lastNextPageErrorUpdatedAtRef.current
    ) {
      return
    }

    lastNextPageErrorUpdatedAtRef.current =
      activeReservationsQuery.errorUpdatedAt
    showToast({ children: '예약 정보를 더 불러오지 못했습니다.' })
  }, [
    activeReservationsQuery.error,
    activeReservationsQuery.errorUpdatedAt,
    activeReservationsQuery.isFetchNextPageError,
  ])

  const loadMoreRef = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled:
      activeReservationsQuery.hasNextPage &&
      !activeReservationsQuery.isFetchingNextPage,
    isLoading: activeReservationsQuery.isFetchingNextPage,
    onIntersect: () => {
      if (
        !activeReservationsQuery.hasNextPage ||
        activeReservationsQuery.isFetchingNextPage
      ) {
        return
      }

      return activeReservationsQuery.fetchNextPage().catch(() => {})
    },
  })

  const handleStatusChange = (status: ReservationStatusFilterValue) => {
    setSearchParams({ status })
    window.scrollTo({ top: 0 })
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
      const canceledReservation =
        await cancelReservationMutation.mutateAsync(reservationId)

      showToast({ children: canceledReservation.message })
      await syncCanceledReservationCache(
        queryClient,
        canceledReservation.reservation,
      )
      setCancelReservationId(null)
      setSearchParams({ status: 'CANCELED' })
      window.scrollTo({ top: 0 })
    } catch {
      // 실패 toast는 공통 mutation error handler에서 처리합니다.
    } finally {
      isCancelRequestLockedRef.current = false
    }
  }

  const handleDetailPress = (reservationId: string) => {
    navigate(ROUTES.reservationDetail.replace(':reservationId', reservationId))
  }

  const handleReviewPress = (reservation: VisitedReservation) => {
    if (reservation.reviewActionState === 'WRITTEN' && reservation.reviewId) {
      navigate(ROUTES.reviewDetail.replace(':reviewId', reservation.reviewId))
      return
    }

    if (
      reservation.reviewActionState !== 'WRITABLE' ||
      !reservation.restaurantId
    ) {
      return
    }

    const pathname = ROUTES.reviewNew.replace(
      ':restaurantId',
      reservation.restaurantId,
    )
    const searchParams = new URLSearchParams({
      reservationId: reservation.reservationId,
    })

    navigate(`${pathname}?${searchParams.toString()}`)
  }

  const handleEmptyActionPress = () => {
    navigate(ROUTES.popularRestaurants)
  }

  return {
    userName: profileSummaryQuery.data?.nickname ?? DEFAULT_USER_NAME,
    selectedStatus,
    reservations,
    totalCount,
    error: profileSummaryQuery.error ?? activeInitialLoadError,
    isLoading: activeReservationsQuery.isPending,
    hasNextPage: activeReservationsQuery.hasNextPage,
    isCancelingReservation: cancelReservationMutation.isPending,
    loadMoreRef,
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
