import { useNavigate } from 'react-router-dom'

import { reservationNotices } from '@/pages/reservationDetail/constants/reservationNotice'
import {
  reservationProgressSteps,
  reservationReceiptInfoItems,
  reservationRestaurant,
} from '@/pages/reservationDetail/mocks/reservationDetail.mock'

export const useReservationDetailPage = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  const handleCancelReservation = () => {
    // TODO: 예약 취소 플로우 연결
  }

  const handleContact = () => {
    // TODO: 문의하기 플로우 연결
  }

  return {
    reservationNotices,
    reservationProgressSteps,
    reservationReceiptInfoItems,
    reservationRestaurant,
    handleBack,
    handleCancelReservation,
    handleContact,
  }
}
