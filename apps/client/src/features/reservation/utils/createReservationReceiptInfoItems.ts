import type { ReservationDetailResponse } from '@/features/reservation/api/getReservationDetail'
import {
  formatReservationDateTime,
  formatReservationGuestSummary,
} from '@/features/reservation/utils/formatReservation'

export interface ReservationReceiptInfoItem {
  label: string
  value: string
}

type ReservationReceiptSource = Pick<
  ReservationDetailResponse,
  | 'reserverName'
  | 'adultCount'
  | 'teenCount'
  | 'childCount'
  | 'restaurantAddress'
  | 'reservedAt'
>

export const createReservationReceiptInfoItems = ({
  reserverName,
  adultCount,
  teenCount,
  childCount,
  restaurantAddress,
  reservedAt,
}: ReservationReceiptSource): ReservationReceiptInfoItem[] => [
  {
    label: '예약자',
    value: reserverName ?? '-',
  },
  {
    label: '인원',
    value:
      formatReservationGuestSummary({
        adult: adultCount ?? 0,
        teen: teenCount ?? 0,
        child: childCount ?? 0,
      }) ?? '-',
  },
  {
    label: '식당 주소',
    value: restaurantAddress ?? '-',
  },
  {
    label: '식당 방문 일정',
    value: formatReservationDateTime(reservedAt) ?? '-',
  },
]
