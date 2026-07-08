export type ReservationGuestType = 'adult' | 'teen' | 'child'

export type ReservationGuestCounts = Record<ReservationGuestType, number>

export const RESERVATION_GUEST_COUNTERS = [
  { key: 'adult', label: '어른' },
  { key: 'teen', label: '청소년' },
  { key: 'child', label: '어린이' },
] satisfies { key: ReservationGuestType; label: string }[]

export const INITIAL_RESERVATION_GUEST_COUNTS = {
  adult: 0,
  teen: 0,
  child: 0,
} satisfies ReservationGuestCounts
