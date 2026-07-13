import type { ReservationProgressStep } from '@/pages/reservationDetail/components/ReservationProgressSection'
import type { ReservationReceiptInfoItem } from '@/pages/reservationDetail/components/ReservationReceiptInfoCard'
import type { ReservationDetailResponse } from '@/pages/reservationDetail/api/getReservationDetail'
import { formatDotDateTime, formatMonthDay } from '@/shared/utils'

type ReservationStatus = NonNullable<
  ReservationDetailResponse['reservationStatus']
>

const BASE_RESERVATION_FEE = 4000

const createDate = (value: string | undefined) => {
  if (!value) {
    return null
  }

  return new Date(value)
}

const formatDotDate = (date: Date | null) => {
  if (!date) {
    return '-'
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}.${month}.${day}`
}

const formatOptionalDotDateTime = (date: Date | null) => {
  if (!date) {
    return '-'
  }

  return formatDotDateTime(date)
}

const formatOptionalMonthDay = (date: Date | null) => {
  if (!date) {
    return undefined
  }

  return formatMonthDay(date)
}

const formatPeopleCount = ({
  adultCount,
  teenCount,
  childCount,
}: Pick<
  ReservationDetailResponse,
  'adultCount' | 'teenCount' | 'childCount'
>) => {
  const countItems = [
    { label: '어른', count: adultCount ?? 0 },
    { label: '청소년', count: teenCount ?? 0 },
    { label: '어린이', count: childCount ?? 0 },
  ].filter((item) => item.count > 0)

  if (countItems.length === 0) {
    return '-'
  }

  return countItems.map((item) => `${item.label} ${item.count}명`).join(', ')
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
  const receivedAt = createDate(reservationDetail.receivedAt)
  const confirmExpectedAt = createDate(reservationDetail.confirmExpectedAt)
  const stepStatuses = getStepStatuses(reservationDetail.reservationStatus)
  const confirmExpectedDate = formatOptionalMonthDay(confirmExpectedAt)

  return [
    {
      id: 'received',
      title: '예약 접수',
      description: '예약 요청이 접수되었어요',
      requestedAt: formatOptionalMonthDay(receivedAt),
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
    value: formatPeopleCount(reservationDetail),
  },
  {
    label: '식당 주소',
    value: reservationDetail.restaurantAddress ?? '-',
  },
  {
    label: '식당 방문 일정',
    value: formatOptionalDotDateTime(createDate(reservationDetail.reservedAt)),
  },
  {
    label: '수수료',
    value: `${BASE_RESERVATION_FEE.toLocaleString()}원`,
  },
]

export const createReservationDetailViewModel = (
  reservationDetail: ReservationDetailResponse,
) => ({
  requestedDate: formatDotDate(createDate(reservationDetail.receivedAt)),
  reservationProgressSteps: createReservationProgressSteps(reservationDetail),
  reservationReceiptInfoItems: createReceiptInfoItems(reservationDetail),
  reservationRestaurant: {
    name: reservationDetail.restaurantName ?? '-',
    localName: reservationDetail.restaurantNameJa ?? '',
    imageSrc: reservationDetail.restaurantImageUrl ?? undefined,
  },
})
