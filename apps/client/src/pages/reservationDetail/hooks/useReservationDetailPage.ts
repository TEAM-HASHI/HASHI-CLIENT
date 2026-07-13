import { useRef, useState } from 'react'
import { showToast } from '@hashi/hds-ui'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { DEFAULT_RESERVATION_STATUS } from '@/pages/myReservations/constants/reservationStatus'
import { reservationNotices } from '@/pages/reservationDetail/constants/reservationNotice'
import { useCancelReservationMutation } from '@/pages/reservationDetail/hooks/useCancelReservationMutation'
import {
  reservationDetailQueryKey,
  useReservationDetailQuery,
} from '@/pages/reservationDetail/hooks/useReservationDetailQuery'
import { createReservationDetailViewModel } from '@/pages/reservationDetail/utils/createReservationDetailViewModel'
import {
  checkIsReservationDetailBlockedStatus,
  parseReservationId,
} from '@/pages/reservationDetail/utils/reservationDetailPolicy'
import { checkIsNotFoundError } from '@/shared/api/apiError'

export const useReservationDetailPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const params = useParams<{ reservationId: string }>()
  const reservationId = parseReservationId(params.reservationId)
  const reservationDetailQuery = useReservationDetailQuery(reservationId)
  const cancelReservationMutation = useCancelReservationMutation()
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const isCancelRequestLockedRef = useRef(false)
  const reservationDetail = reservationDetailQuery.data
  const isBlockedReservationStatus = reservationDetail
    ? checkIsReservationDetailBlockedStatus(reservationDetail.reservationStatus)
    : false
  const viewModel = reservationDetail
    ? createReservationDetailViewModel(reservationDetail)
    : null

  const handleBack = () => {
    navigate(-1)
  }

  const handleCancelReservation = () => {
    setIsCancelDialogOpen(true)
  }

  const handleCancelDialogOpenChange = (open: boolean) => {
    if (!open && cancelReservationMutation.isPending) {
      return
    }

    setIsCancelDialogOpen(open)
  }

  const handleConfirmCancelPress = async () => {
    if (reservationId === null) {
      return
    }

    if (
      isCancelRequestLockedRef.current ||
      cancelReservationMutation.isPending
    ) {
      return
    }

    isCancelRequestLockedRef.current = true

    try {
      const canceledReservation =
        await cancelReservationMutation.mutateAsync(reservationId)
      const queryKey = reservationDetailQueryKey(reservationId)

      queryClient.setQueryData(queryKey, canceledReservation.reservation)
      void queryClient.invalidateQueries({
        queryKey,
        refetchType: 'inactive',
      })

      showToast({ children: canceledReservation.message })
      setIsCancelDialogOpen(false)
      navigate(`${ROUTES.myReservations}?status=${DEFAULT_RESERVATION_STATUS}`)
    } catch {
      // 실패 toast는 공통 mutation error handler에서 처리합니다.
    } finally {
      isCancelRequestLockedRef.current = false
    }
  }

  const handleHome = () => {
    navigate(ROUTES.home)
  }

  return {
    reservationId,
    error: reservationDetailQuery.error,
    isInvalidReservationId: reservationId === null,
    isLoading: reservationDetailQuery.isPending,
    isCancelingReservation: cancelReservationMutation.isPending,
    isNotFound:
      isBlockedReservationStatus ||
      checkIsNotFoundError(reservationDetailQuery.error),
    viewModel,
    isCancelDialogOpen,
    reservationNotices,
    handleBack,
    handleCancelDialogOpenChange,
    handleCancelReservation,
    handleConfirmCancelPress,
    handleHome,
  }
}
