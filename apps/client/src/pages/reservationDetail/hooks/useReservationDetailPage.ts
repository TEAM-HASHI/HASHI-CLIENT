import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { DEFAULT_RESERVATION_STATUS } from '@/pages/myReservations/constants/reservationStatus'
import { reservationNotices } from '@/pages/reservationDetail/constants/reservationNotice'
import {
  reservationProgressSteps,
  reservationReceiptInfoItems,
  reservationRestaurant,
} from '@/pages/reservationDetail/mocks/reservationDetail.mock'

export const useReservationDetailPage = () => {
  const navigate = useNavigate()
  const { reservationId } = useParams<{ reservationId: string }>()
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  const handleBack = () => {
    navigate(-1)
  }

  const handleCancelReservation = () => {
    setIsCancelDialogOpen(true)
  }

  const handleCancelDialogOpenChange = (open: boolean) => {
    setIsCancelDialogOpen(open)
  }

  const handleConfirmCancelPress = () => {
    // TODO: 예약 취소 API와 성공 Toast 연결
    setIsCancelDialogOpen(false)
    navigate(`${ROUTES.myReservations}?status=${DEFAULT_RESERVATION_STATUS}`)
  }

  const handleHome = () => {
    navigate(ROUTES.home)
  }

  return {
    reservationId,
    isCancelDialogOpen,
    reservationNotices,
    reservationProgressSteps,
    reservationReceiptInfoItems,
    reservationRestaurant,
    handleBack,
    handleCancelDialogOpenChange,
    handleCancelReservation,
    handleConfirmCancelPress,
    handleHome,
  }
}
