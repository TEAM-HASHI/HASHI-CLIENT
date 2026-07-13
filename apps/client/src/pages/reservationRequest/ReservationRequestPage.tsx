import { BackIcon } from '@hashi/hds-icons'
import { Button, Header, IconButton } from '@hashi/hds-ui'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { myPointBalanceQueryOptions } from '@/features/point'
import { ReservationConfirmDialog } from '@/pages/reservationRequest/components/ReservationConfirmDialog'
import { ReservationNoticeSection } from '@/pages/reservationRequest/components/ReservationNoticeSection'
import { ReservationPointSection } from '@/pages/reservationRequest/components/ReservationPointSection'
import { ReservationRequestInfoSection } from '@/pages/reservationRequest/components/ReservationRequestInfoSection'
import { useCreateReservationMutation } from '@/pages/reservationRequest/hooks/useCreateReservationMutation'
import { useReservationPoint } from '@/pages/reservationRequest/hooks/useReservationPoint'
import { useReservationRequestDraft } from '@/pages/reservationRequest/hooks/useReservationRequestDraft'
import type { ReservationRequestDraft } from '@/pages/reservationRequest/hooks/useReservationRequestDraft'
import { formatReservationDateTime } from '@/pages/reservationRequest/utils/formatReservationDateTime'
import { formatReservationGuests } from '@/pages/reservationRequest/utils/formatReservationGuests'

const ANYWHERE_RESERVATION_FEE = 4_000

interface ReservationRequestContentProps {
  reservationDraft: ReservationRequestDraft
}

const ReservationRequestContent = ({
  reservationDraft,
}: ReservationRequestContentProps) => {
  const navigate = useNavigate()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const { data: pointBalance } = useSuspenseQuery(myPointBalanceQueryOptions)
  const createReservationMutation = useCreateReservationMutation()
  const paymentAmount =
    reservationDraft.source === 'anywhere'
      ? ANYWHERE_RESERVATION_FEE
      : reservationDraft.reservationFee
  const reservationPoint = useReservationPoint({
    availablePoint: pointBalance.availablePoint,
    paymentAmount,
  })

  const guestText = formatReservationGuests(reservationDraft.guests)
  const visitDateTime = formatReservationDateTime({
    date: reservationDraft.date,
    time: reservationDraft.time,
  })
  const restaurantAddress = reservationDraft.restaurantAddress
  const restaurantImageUrl = reservationDraft.restaurantImageUrl
  const isAnywhereReservation = reservationDraft.source === 'anywhere'

  const handleBackClick = () => {
    navigate(-1)
  }

  const handleRequestClick = () => {
    setIsConfirmOpen(true)
  }

  const handleConfirmClick = () => {
    if (createReservationMutation.isPending) {
      return
    }

    createReservationMutation.mutate(
      {
        draft: reservationDraft,
        usedPoint: reservationPoint.usedPoint,
      },
      {
        onSuccess: ({ reservationId }) => {
          setIsConfirmOpen(false)
          navigate(
            generatePath(ROUTES.reservationDetail, {
              reservationId: String(reservationId),
            }),
          )
        },
      },
    )
  }

  return (
    <div className="min-h-dvh bg-white pt-18.75 pb-[128px]">
      <Header
        className="app-mobile-fixed-top z-fixed fixed"
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
        isAnywhereReservation={isAnywhereReservation}
        restaurantAddress={restaurantAddress}
        restaurantImageUrl={restaurantImageUrl}
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

      <div className="app-mobile-fixed-bottom z-fixed bg-white px-5 pt-[17px] pb-[calc(17px+var(--safe-area-bottom,0px))]">
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
        isConfirming={createReservationMutation.isPending}
        onConfirm={handleConfirmClick}
        onOpenChange={setIsConfirmOpen}
        open={isConfirmOpen}
        restaurantAddress={restaurantAddress}
        visitDateTime={visitDateTime}
      />
    </div>
  )
}

export const ReservationRequestPage = () => {
  const navigate = useNavigate()
  const reservationDraft = useReservationRequestDraft()

  useEffect(() => {
    if (!reservationDraft) {
      navigate(ROUTES.home, { replace: true })
    }
  }, [navigate, reservationDraft])

  if (!reservationDraft) {
    return null
  }

  return <ReservationRequestContent reservationDraft={reservationDraft} />
}
