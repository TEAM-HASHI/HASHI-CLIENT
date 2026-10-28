import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { showToast } from '@hashi/hds-ui'
import { useNavigate } from 'react-router-dom'

import { getRestaurantReviewNewPath } from '@/app/router/routePaths'
import { getVisitedReservations } from '@/features/review/api/getVisitedReservations'
import { checkIsAuthRequiredError } from '@/shared/api'
import {
  getAuthSessionVersion,
  wasAuthSessionExpired,
} from '@/shared/auth/authSession'
import { visitedReservationQueryKeys } from '@/features/review/queries/visitedReservationQueryKeys'

interface UseRestaurantReviewWriteNavigationParams {
  isAuthenticated: boolean
  onAuthRequired: () => void
  onReviewUnavailable: () => void
  restaurantId: number
  onBeforeNavigate?: () => void
}

export const useRestaurantReviewWriteNavigation = ({
  isAuthenticated,
  onAuthRequired,
  onReviewUnavailable,
  restaurantId,
  onBeforeNavigate,
}: UseRestaurantReviewWriteNavigationParams) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const pending = useRef<object | null>(null)
  useEffect(
    () => () => {
      pending.current = null
    },
    [restaurantId],
  )

  const handlePressWriteReview = useCallback(async () => {
    if (!isAuthenticated) {
      onAuthRequired()
      return
    }

    if (pending.current) return
    const attempt = {}
    pending.current = attempt
    const session = getAuthSessionVersion()
    const isCurrent = () =>
      pending.current === attempt && getAuthSessionVersion() === session

    try {
      const response = await queryClient.fetchQuery({
        queryFn: () =>
          getVisitedReservations({
            restaurantId,
            reviewStatus: 'unreviewed',
            size: 1,
          }),
        queryKey: visitedReservationQueryKeys.reviewWrite(
          restaurantId,
          session,
        ),
        staleTime: 0,
        retry: false,
      })
      if (!isCurrent()) return
      const writableReservation = response.content?.find(
        (reservation) =>
          reservation.reviewable === true &&
          typeof reservation.reservationId === 'number' &&
          Number.isSafeInteger(reservation.reservationId) &&
          reservation.reservationId > 0 &&
          reservation.restaurantId === restaurantId,
      )

      if (!writableReservation) {
        onReviewUnavailable()
        return
      }

      onBeforeNavigate?.()
      navigate(
        getRestaurantReviewNewPath(
          String(writableReservation.restaurantId),
          String(writableReservation.reservationId),
        ),
      )
    } catch (caughtError) {
      if (
        pending.current !== attempt ||
        (!isCurrent() &&
          !(
            checkIsAuthRequiredError(caughtError) &&
            wasAuthSessionExpired(session)
          ))
      )
        return
      if (checkIsAuthRequiredError(caughtError)) {
        onAuthRequired()
        return
      }

      showToast({ children: '리뷰 작성 가능 여부를 확인하지 못했어요.' })
    } finally {
      if (pending.current === attempt) pending.current = null
    }
  }, [
    isAuthenticated,
    navigate,
    onAuthRequired,
    onReviewUnavailable,
    onBeforeNavigate,
    queryClient,
    restaurantId,
  ])

  return {
    onPressWriteReview: handlePressWriteReview,
  }
}
