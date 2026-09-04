import {
  formatReservationDate,
  formatReservationDateTime,
  formatReservationGuestSummary,
  formatReservationMonthDay,
} from '@/features/reservation/utils/formatReservation'
import type { ReservationDetailResponse } from '@/pages/reservationDetail/api/getReservationDetail'
import type { ReservationProgressStep } from '@/pages/reservationDetail/components/ReservationProgressSection'
import type { ReservationReceiptInfoItem } from '@/pages/reservationDetail/components/ReservationReceiptInfoCard'

type ReservationStatus = NonNullable<
  ReservationDetailResponse['reservationStatus']
>

const formatReservationGuestSummaryWithFallback = ({
  adultCount,
  teenCount,
  childCount,
}: Pick<
  ReservationDetailResponse,
  'adultCount' | 'teenCount' | 'childCount'
>) => {
  return (
    formatReservationGuestSummary({
      adult: adultCount ?? 0,
      teen: teenCount ?? 0,
      child: childCount ?? 0,
    }) ?? '-'
  )
}

const formatAmount = (amount: number | undefined) => {
  if (amount === undefined) {
    return '-'
  }

  return `${amount.toLocaleString()}원`
}

const getStepStatuses = (
  reservationStatus: ReservationStatus | undefined,
): Record<
  'received' | 'contacting' | 'confirmed',
  ReservationProgressStep['status']
> => {
  if (reservationStatus === 'REQUESTED') {
    return {
      received: 'current',
      contacting: 'pending',
      confirmed: 'pending',
    }
  }

  if (reservationStatus === 'CONFIRMED' || reservationStatus === 'VISITED') {
    return {
      received: 'completed',
      contacting: 'completed',
      confirmed: 'completed',
    }
  }

  return {
    received: 'completed',
    contacting: 'current',
    confirmed: 'pending',
  }
}

const createReservationProgressSteps = (
  reservationDetail: ReservationDetailResponse,
): ReservationProgressStep[] => {
  const stepStatuses = getStepStatuses(reservationDetail.reservationStatus)
  const confirmExpectedDate = formatReservationMonthDay(
    reservationDetail.confirmExpectedAt,
  )

  return [
    {
      id: 'received',
      title: '예약 접수',
      description: '예약 요청이 접수되었어요',
      requestedAt:
        formatReservationMonthDay(reservationDetail.receivedAt) ?? undefined,
      status: stepStatuses.received,
    },
    {
      id: 'contacting',
      title: '식당 컨택 중',
      description: '식당에 예약 가능 여부를 확인하고 있어요',
      status: stepStatuses.contacting,
    },
    {
      id: 'confirmed',
      title: '예약 확정',
      description: '식당 확인 후 예약 결과를 알려드릴게요',
      requestedAt:
        stepStatuses.confirmed === 'pending' && confirmExpectedDate
          ? `예정 ${confirmExpectedDate}`
          : undefined,
      status: stepStatuses.confirmed,
    },
  ]
}

const createReceiptInfoItems = (
  reservationDetail: ReservationDetailResponse,
): ReservationReceiptInfoItem[] => [
  {
    label: '예약자',
    value: reservationDetail.reserverName ?? '-',
  },
  {
    label: '인원',
    value: formatReservationGuestSummaryWithFallback(reservationDetail),
  },
  {
    label: '식당 주소',
    value: reservationDetail.restaurantAddress ?? '-',
  },
  {
    label: '식당 방문 일정',
    value: formatReservationDateTime(reservationDetail.reservedAt) ?? '-',
  },
  {
    label: '수수료',
    value: formatAmount(reservationDetail.amount),
  },
]

export const createReservationDetailViewModel = (
  reservationDetail: ReservationDetailResponse,
) => ({
  requestedDate: formatReservationDate(reservationDetail.receivedAt) ?? '-',
  reservationProgressSteps: createReservationProgressSteps(reservationDetail),
  reservationReceiptInfoItems: createReceiptInfoItems(reservationDetail),
  reservationRestaurant: {
    name: reservationDetail.restaurantName ?? '-',
    localName: reservationDetail.restaurantNameJa ?? '',
    imageSrc: reservationDetail.restaurantImageUrl ?? undefined,
  },
})
