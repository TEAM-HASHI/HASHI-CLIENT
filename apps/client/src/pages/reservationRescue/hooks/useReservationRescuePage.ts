import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { useReservationDetailQuery } from '@/pages/reservationDetail/hooks/useReservationDetailQuery'
import { parseReservationId } from '@/pages/reservationDetail/utils/reservationDetailPolicy'
import {
  createReservationRescueRestaurants,
  reservationRescueQueryOptions,
} from '@/pages/reservationRescue/queries/reservationRescueQueryOptions'

const CANCELED_RESERVATIONS_PATH = `${ROUTES.myReservations}?status=CANCELED`

const getRestaurantDetailPath = (restaurantId: string) =>
  ROUTES.restaurantDetail.replace(
    ':restaurantId',
    encodeURIComponent(restaurantId),
  )

export const useReservationRescuePage = () => {
  const navigate = useNavigate()
  const params = useParams<{ reservationId: string }>()
  const reservationId = parseReservationId(params.reservationId)
  const reservationDetailQuery = useReservationDetailQuery(reservationId)
  const reservationDetail = reservationDetailQuery.data
  const excludedRestaurantId =
    reservationDetail?.reservationStatus === 'CANCELED'
      ? reservationDetail.restaurantId
      : undefined
  const hasValidCanceledReservation =
    excludedRestaurantId !== undefined && excludedRestaurantId > 0
  const restaurantsQuery = useQuery({
    ...reservationRescueQueryOptions(),
    enabled: hasValidCanceledReservation,
    throwOnError: false,
  })
  const restaurants = hasValidCanceledReservation
    ? createReservationRescueRestaurants(
        restaurantsQuery.data?.restaurants ?? [],
        excludedRestaurantId,
      )
    : []
  const shouldRedirect =
    reservationId === null ||
    (reservationDetailQuery.isSuccess && !hasValidCanceledReservation)

  useEffect(() => {
    if (!shouldRedirect) {
      return
    }

    navigate(CANCELED_RESERVATIONS_PATH, { replace: true })
  }, [navigate, shouldRedirect])

  const handleBack = () => {
    navigate(CANCELED_RESERVATIONS_PATH, { replace: true })
  }

  const handleCanceledReservations = () => {
    navigate(CANCELED_RESERVATIONS_PATH)
  }

  const handleHashiPick = () => {
    navigate(ROUTES.hashiPickRestaurants)
  }

  const handleRestaurant = (restaurantIdToOpen: string) => {
    navigate(getRestaurantDetailPath(restaurantIdToOpen))
  }

  const handleRetry = () => {
    void restaurantsQuery.refetch()
  }

  return {
    error: reservationDetailQuery.error,
    isInvalidReservationId: reservationId === null,
    isReservationError: reservationDetailQuery.isError,
    isReservationLoading: reservationDetailQuery.isPending,
    isRestaurantsError: restaurantsQuery.isError,
    isRestaurantsLoading: restaurantsQuery.isPending,
    restaurants,
    shouldRedirect,
    handleBack,
    handleCanceledReservations,
    handleHashiPick,
    handleRestaurant,
    handleRetry,
  }
}
