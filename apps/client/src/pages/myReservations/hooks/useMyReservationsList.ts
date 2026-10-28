import { useMemo } from 'react'
import type { InfiniteData } from '@tanstack/react-query'

import {
  type MyReservationsApiStatus,
  useMyReservationsInfiniteQuery,
} from '@/features/reservation'
import type { ReservationListResponse } from '@/features/reservation/api/getMyReservations'
import { useVisitedReservationsInfiniteQuery } from '@/features/review/queries/visitedReservations'
import type { ReservationStatusFilterValue } from '@/pages/myReservations/constants/reservationStatus'
import type { MyReservation } from '@/pages/myReservations/types'
import {
  createMyReservationViewModel,
  createMyVisitedReservationViewModel,
} from '@/pages/myReservations/utils/createMyReservationViewModel'
import {
  createListReturnStore,
  useInfiniteScrollTrigger,
  useListReturnRestoration,
} from '@/shared/hooks'

const reservationListReturnStore =
  createListReturnStore<InfiniteData<ReservationListResponse, number | null>>()

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

export const useMyReservationsList = (
  selectedStatus: ReservationStatusFilterValue,
  locationKey: string,
) => {
  const apiStatus = getMyReservationsApiStatus(selectedStatus)
  const reservationsQuery = useMyReservationsInfiniteQuery({
    status: apiStatus,
    initialData:
      selectedStatus === 'UPCOMING'
        ? (reservationListReturnStore.read(locationKey)?.data ?? undefined)
        : undefined,
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
  const {
    scrollRef: listScrollRef,
    capture: captureListReturn,
    reset: resetListScroll,
  } = useListReturnRestoration({
    locationKey,
    ready: selectedStatus === 'UPCOMING' && !activeReservationsQuery.isPending,
    store: reservationListReturnStore,
  })

  const loadMoreRef = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled:
      activeReservationsQuery.hasNextPage &&
      !activeReservationsQuery.isFetchNextPageError &&
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

  const handleRetryLoadMore = () => {
    void activeReservationsQuery.fetchNextPage().catch(() => {})
  }

  const captureDetailReturn = () => {
    if (selectedStatus === 'UPCOMING' && reservationsQuery.data) {
      captureListReturn(reservationsQuery.data)
    }
  }

  return {
    reservations,
    totalCount,
    error: activeInitialLoadError,
    isLoading: activeReservationsQuery.isPending,
    hasNextPage: activeReservationsQuery.hasNextPage,
    isFetchNextPageError: activeReservationsQuery.isFetchNextPageError,
    isFetchingNextPage: activeReservationsQuery.isFetchingNextPage,
    loadMoreRef,
    listScrollRef,
    resetListScroll,
    captureDetailReturn,
    handleRetryLoadMore,
  }
}
