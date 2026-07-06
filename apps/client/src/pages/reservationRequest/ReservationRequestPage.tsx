import { BackIcon } from '@hashi/hds-icons'
import { Button, Header, IconButton } from '@hashi/hds-ui'
import { useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { ReservationConfirmDialog } from '@/pages/reservationRequest/components/ReservationConfirmDialog'
import { ReservationNoticeSection } from '@/pages/reservationRequest/components/ReservationNoticeSection'
import { ReservationPointSection } from '@/pages/reservationRequest/components/ReservationPointSection'
import { ReservationRequestInfoSection } from '@/pages/reservationRequest/components/ReservationRequestInfoSection'
import { useReservationPoint } from '@/pages/reservationRequest/hooks/useReservationPoint'
import { useReservationRequestDraft } from '@/pages/reservationRequest/hooks/useReservationRequestDraft'
import { formatReservationDateTime } from '@/pages/reservationRequest/utils/formatReservationDateTime'
import { formatReservationGuests } from '@/pages/reservationRequest/utils/formatReservationGuests'

const MOCK_RESERVATION_ID = 'mock-reservation-id'

const RESERVATION_REQUEST_MOCK = {
  restaurantImageUrl: null,
  restaurantAddress: '도쿄 키츠라멘 본점도쿄 키츠라멘 본점',
  availablePoint: 9000,
  paymentAmount: 4000,
}

export const ReservationRequestPage = () => {
  const navigate = useNavigate()
  const reservationDraft = useReservationRequestDraft()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const reservationPoint = useReservationPoint({
    availablePoint: RESERVATION_REQUEST_MOCK.availablePoint,
    paymentAmount: RESERVATION_REQUEST_MOCK.paymentAmount,
  })

  const guestText = formatReservationGuests(reservationDraft.guests)
  const visitDateTime = formatReservationDateTime({
    date: reservationDraft.date,
    time: reservationDraft.time,
  })

  const handleBackClick = () => {
    navigate(-1)
  }

  const handleRequestClick = () => {
    setIsConfirmOpen(true)
  }

  const handleConfirmClick = () => {
    navigate(
      generatePath(ROUTES.reservationDetail, {
        reservationId: MOCK_RESERVATION_ID,
      }),
    )
  }

  return (
    <div className="min-h-dvh bg-white pb-[128px]">
      <Header
        className="sticky top-0 z-10"
        leftAction={
          <IconButton aria-label="뒤로가기" onClick={handleBackClick} size="xs">
            <BackIcon className="size-6" />
          </IconButton>
        }
        title="예약하기"
      />

      <ReservationRequestInfoSection
        guestName={reservationDraft.guestName}
        guestText={guestText}
        restaurantAddress={RESERVATION_REQUEST_MOCK.restaurantAddress}
        restaurantImageUrl={RESERVATION_REQUEST_MOCK.restaurantImageUrl}
        restaurantName={reservationDraft.restaurantName}
        visitDateTime={visitDateTime}
      />

      <ReservationPointSection
        finalPaymentAmount={reservationPoint.finalPaymentAmount}
        onPointInputChange={reservationPoint.onPointInputChange}
        onUseAllPointsClick={reservationPoint.onUseAllPointsClick}
        remainingPoint={reservationPoint.remainingPoint}
        usedPoint={reservationPoint.usedPoint}
      />

      <ReservationNoticeSection />

      <div className="app-mobile-fixed-bottom z-20 bg-white px-5 pt-[17px] pb-[calc(17px+var(--safe-area-bottom,0px))]">
        <Button
          className="h-[46px]"
          onClick={handleRequestClick}
          size="lg"
          width="full"
        >
          예약 요청
        </Button>
      </div>

      <ReservationConfirmDialog
        finalPaymentAmount={reservationPoint.finalPaymentAmount}
        guestName={reservationDraft.guestName}
        guestText={guestText}
        onConfirm={handleConfirmClick}
        onOpenChange={setIsConfirmOpen}
        open={isConfirmOpen}
        restaurantAddress={RESERVATION_REQUEST_MOCK.restaurantAddress}
        visitDateTime={visitDateTime}
      />
    </div>
  )
}
