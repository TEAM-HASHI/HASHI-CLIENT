import type { InfiniteData, QueryClient } from '@tanstack/react-query'

import type {
  ReservationListResponse,
  ReservationResponse,
} from '@/pages/myReservations/api/getMyReservations'
import { myReservationsQueryKeys } from '@/pages/myReservations/queries/myReservationsQueryKeys'
import { myReservationsInfiniteQueryOptions } from '@/pages/myReservations/queries/useMyReservationsInfiniteQuery'

const removeReservationFromUpcomingCache = (
  queryData: InfiniteData<ReservationListResponse> | undefined,
  reservationId: number | undefined,
) => {
  if (!queryData || reservationId === undefined) {
    return queryData
  }

  let isRemoved = false
  const pages = queryData.pages.map((page) => {
    const reservations = page.reservations ?? []
    const nextReservations = reservations.filter((reservation) => {
      const shouldRemove = reservation.reservationId === reservationId

      if (shouldRemove) {
        isRemoved = true
      }

      return !shouldRemove
    })

    return {
      ...page,
      reservations: nextReservations,
    }
  })

  if (!isRemoved) {
    return queryData
  }

  return {
    ...queryData,
    pages: pages.map((page) => ({
      ...page,
      totalCount:
        page.totalCount === undefined
          ? page.totalCount
          : Math.max(page.totalCount - 1, 0),
    })),
  }
}

const addReservationToCanceledCache = (
  queryData: InfiniteData<ReservationListResponse> | undefined,
  reservation: ReservationResponse,
) => {
  const canceledReservation = {
    ...reservation,
    reservationStatus: 'CANCELED',
  } satisfies ReservationResponse

  if (!queryData) {
    return {
      pages: [
        {
          reservations: [canceledReservation],
          hasNext: false,
          totalCount: 1,
        },
      ],
      pageParams: [null],
    } satisfies InfiniteData<ReservationListResponse>
  }

  const isAlreadyIncluded = queryData.pages.some((page) =>
    page.reservations?.some(
      (item) => item.reservationId === canceledReservation.reservationId,
    ),
  )

  if (isAlreadyIncluded) {
    return queryData
  }

  return {
    ...queryData,
    pages: queryData.pages.map((page, index) => ({
      ...page,
      reservations:
        index === 0
          ? [canceledReservation, ...(page.reservations ?? [])]
          : page.reservations,
      totalCount:
        page.totalCount === undefined ? page.totalCount : page.totalCount + 1,
    })),
  }
}

export const syncCanceledReservationCache = async (
  queryClient: QueryClient,
  reservation: ReservationResponse,
) => {
  await queryClient.cancelQueries({
    queryKey: myReservationsQueryKeys.all,
  })

  try {
    await queryClient.fetchInfiniteQuery(
      myReservationsInfiniteQueryOptions('CANCELED'),
    )
  } catch {
    // 취소 성공 후 목록 캐시 보정은 UX 보조 로직이라 실패해도 화면 전환을 막지 않습니다.
  }

  queryClient.setQueryData<InfiniteData<ReservationListResponse>>(
    myReservationsQueryKeys.infiniteList('UPCOMING'),
    (queryData) =>
      removeReservationFromUpcomingCache(queryData, reservation.reservationId),
  )
  queryClient.setQueryData<InfiniteData<ReservationListResponse>>(
    myReservationsQueryKeys.infiniteList('CANCELED'),
    (queryData) => addReservationToCanceledCache(queryData, reservation),
  )
}
