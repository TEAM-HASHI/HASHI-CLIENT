import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { useCancelReservationMutation } from '@/features/reservation'
import { reservationDetailQueryKey } from '@/pages/reservationDetail/hooks/useReservationDetailQuery'

export const useReservationDetailCancellation = (
  reservationId: number | null,
  canCancelReservation: boolean,
) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const cancelReservationMutation = useCancelReservationMutation({
    onCanceled: ({ reservation }) => {
      if (reservationId === null) {
        return
      }

      const queryKey = reservationDetailQueryKey(reservationId)

      queryClient.setQueryData(queryKey, reservation)
      void queryClient.invalidateQueries({
        queryKey,
        refetchType: 'inactive',
      })
    },
  })
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const isCancelRequestLockedRef = useRef(false)

  const handleCancelReservation = () => {
    if (!canCancelReservation) {
      return
    }

    setIsCancelDialogOpen(true)
  }

  const handleCancelDialogOpenChange = (open: boolean) => {
    if (!open && cancelReservationMutation.isPending) {
      return
    }

    setIsCancelDialogOpen(open)
  }

  const handleConfirmCancelPress = async () => {
    if (reservationId === null || !canCancelReservation) {
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
      await cancelReservationMutation.mutateAsync(reservationId)

      setIsCancelDialogOpen(false)
      navigate(`${ROUTES.myReservations}?status=CANCELED`)
    } catch {
      // 실패 toast는 공통 mutation error handler에서 처리합니다.
    } finally {
      isCancelRequestLockedRef.current = false
    }
  }

  return {
    isCancelingReservation: cancelReservationMutation.isPending,
    isCancelDialogOpen,
    handleCancelDialogOpenChange,
    handleCancelReservation,
    handleConfirmCancelPress,
  }
}
