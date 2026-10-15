import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { useReservationDetailCancellation } from '@/pages/reservationDetail/hooks/useReservationDetailCancellation'
import { useReservationDetailQuery } from '@/pages/reservationDetail/hooks/useReservationDetailQuery'
import { createReservationDetailViewModel } from '@/pages/reservationDetail/utils/createReservationDetailViewModel'
import {
  checkIsReservationDetailBlockedStatus,
  parseReservationId,
} from '@/pages/reservationDetail/utils/reservationDetailPolicy'
import { checkHasHttpStatus, checkIsNotFoundError } from '@/shared/api/apiError'
import { HASHI_KAKAO_CHANNEL_URL } from '@/shared/constants/contact'

type ReservationDetailLocationState = {
  fromReservationRequest?: boolean
  fromReservationList?: boolean
}

const checkIsReservationRequestEntryState = (
  state: unknown,
): state is ReservationDetailLocationState => {
  return (
    typeof state === 'object' &&
    state !== null &&
    'fromReservationRequest' in state &&
    (state as ReservationDetailLocationState).fromReservationRequest === true
  )
}

const checkIsReservationListEntryState = (
  state: unknown,
): state is ReservationDetailLocationState =>
  typeof state === 'object' &&
  state !== null &&
  'fromReservationList' in state &&
  (state as ReservationDetailLocationState).fromReservationList === true

export const useReservationDetailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams<{ reservationId: string }>()
  const reservationId = parseReservationId(params.reservationId)
  const reservationDetailQuery = useReservationDetailQuery(reservationId)
  const reservationDetail = reservationDetailQuery.data
  const isBlockedReservationStatus = reservationDetail
    ? checkIsReservationDetailBlockedStatus(reservationDetail.reservationStatus)
    : false
  const viewModel = reservationDetail
    ? createReservationDetailViewModel(reservationDetail)
    : null
  const isReservationRequestEntry = checkIsReservationRequestEntryState(
    location.state,
  )
  const canCancelReservation =
    reservationDetail?.reservationStatus === 'REQUESTED' ||
    reservationDetail?.reservationStatus === 'CONTACTING' ||
    reservationDetail?.reservationStatus === 'CONFIRMED'
  const cancellation = useReservationDetailCancellation(
    reservationId,
    canCancelReservation,
  )

  const handleBack = () => {
    if (isReservationRequestEntry) {
      navigate(ROUTES.myReservations, { replace: true })
      return
    }

    if (checkIsReservationListEntryState(location.state)) {
      navigate(-1)
      return
    }

    navigate(ROUTES.myReservations, { replace: true })
  }

  const handleContact = () => {
    window.open(HASHI_KAKAO_CHANNEL_URL, '_blank', 'noreferrer')
  }

  return {
    error: reservationDetailQuery.error,
    isInvalidReservationId: reservationId === null,
    isLoading: reservationDetailQuery.isPending,
    canCancelReservation,
    isNotFound:
      isBlockedReservationStatus ||
      checkIsNotFoundError(reservationDetailQuery.error) ||
      (checkHasHttpStatus(reservationDetailQuery.error) &&
        reservationDetailQuery.error.status === 403),
    viewModel,
    handleBack,
    handleContact,
    ...cancellation,
  }
}
