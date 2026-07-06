import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'
import { useNavigate } from 'react-router-dom'

import {
  ReservationDetailActionBar,
  ReservationNoticeSection,
  ReservationProgressSection,
  ReservationReceiptInfoCard,
} from '@/features/reservation/components'
import { reservationNotices } from '@/features/reservation/constants'
import {
  reservationProgressSteps,
  reservationReceiptInfoItems,
  reservationRestaurant,
} from '@/features/reservation/mocks/reservationDetail.mock'
import { cn } from '@/shared/utils'

const actionBarSafeSpaceClassName =
  'pb-[calc(80px+var(--safe-area-bottom,0px))]'

export const ReservationDetailPage = () => {
  const navigate = useNavigate()
  const handleCancelReservation = () => {
    // TODO: 예약 취소 플로우 연결
  }
  const handleContact = () => {
    // TODO: 문의하기 플로우 연결
  }

  return (
    <section
      className={cn('min-h-dvh', 'pt-18.75', actionBarSafeSpaceClassName)}
    >
      <Header
        leftAction={
          <IconButton
            aria-label="이전 페이지로 이동"
            onClick={() => {
              navigate(-1)
            }}
            size="xs"
          >
            <BackIcon className="size-6" />
          </IconButton>
        }
        title="예약 상세"
        className="app-mobile-fixed-top z-fixed border-warm-gray-50 fixed border-b"
      />
      <div className="px-6">
        <ReservationProgressSection
          requestedDate="2026.6.21"
          requestedLabel="예약 신청"
          restaurant={reservationRestaurant}
          steps={reservationProgressSteps}
        />
        <ReservationReceiptInfoCard
          items={reservationReceiptInfoItems}
          title="예약 접수 정보"
        />
      </div>
      <ReservationNoticeSection notices={reservationNotices} />
      <ReservationDetailActionBar
        onCancel={handleCancelReservation}
        onContact={handleContact}
      />
    </section>
  )
}
