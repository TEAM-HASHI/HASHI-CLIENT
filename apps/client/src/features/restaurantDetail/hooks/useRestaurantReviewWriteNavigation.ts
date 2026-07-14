import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { visitedReservationsQueryOptions } from '@/features/review/queries/visitedReservations'
import { getRestaurantReviewNewPath } from '@/features/restaurantDetail/utils/restaurantDetailRoutes'
import { checkIsAuthRequiredError } from '@/shared/api'

interface UseRestaurantReviewWriteNavigationParams {
  isAuthenticated: boolean
  onAuthRequired: () => void
  onReviewUnavailable: () => void
  restaurantId: number
}

export const useRestaurantReviewWriteNavigation = ({
  isAuthenticated,
  onAuthRequired,
  onReviewUnavailable,
  restaurantId,
}: UseRestaurantReviewWriteNavigationParams) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isCheckingReviewableReservationRef = useRef(false)
  const [error, setError] = useState<unknown>(null)

  const handlePressWriteReview = useCallback(async () => {
    if (!isAuthenticated) {
      setError(null)
      onAuthRequired()
      return
    }

    if (isCheckingReviewableReservationRef.current) {
      return
    }

    isCheckingReviewableReservationRef.current = true
    setError(null)

    try {
      const response = await queryClient.fetchQuery(
        visitedReservationsQueryOptions({
          restaurantId,
          reviewStatus: 'unreviewed',
          size: 1,
        }),
      )
      const writableReservation = response.content?.find(
        (reservation) =>
          reservation.reviewable === true &&
          typeof reservation.reservationId === 'number' &&
          typeof reservation.restaurantId === 'number',
      )

      if (!writableReservation) {
        onReviewUnavailable()
        return
      }

      navigate(
        getRestaurantReviewNewPath(
          String(writableReservation.restaurantId),
          String(writableReservation.reservationId),
        ),
      )
    } catch (caughtError) {
      if (checkIsAuthRequiredError(caughtError)) {
        onAuthRequired()
        return
      }

      setError(caughtError)
    } finally {
      isCheckingReviewableReservationRef.current = false
    }
  }, [
    isAuthenticated,
    navigate,
    onAuthRequired,
    onReviewUnavailable,
    queryClient,
    restaurantId,
  ])

  return {
    error,
    onPressWriteReview: handlePressWriteReview,
  }
}
