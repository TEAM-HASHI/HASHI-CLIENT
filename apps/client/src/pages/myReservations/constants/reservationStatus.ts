export type ReservationStatusFilterValue =
  | 'IN_PROGRESS'
  | 'UPCOMING'
  | 'VISITED'
  | 'CANCELED'

export const DEFAULT_RESERVATION_STATUS: ReservationStatusFilterValue =
  'IN_PROGRESS'

export const RESERVATION_STATUS_FILTER_OPTIONS = [
  { label: '진행 중', value: 'IN_PROGRESS' },
  { label: '방문 예정', value: 'UPCOMING' },
  { label: '방문 완료', value: 'VISITED' },
  { label: '예약 취소', value: 'CANCELED' },
] satisfies {
  label: string
  value: ReservationStatusFilterValue
}[]
