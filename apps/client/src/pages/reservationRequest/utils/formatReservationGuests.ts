import type { ReservationGuestCounts } from '@/pages/reservationRequest/hooks/useReservationRequestDraft'

const GUEST_LABELS = [
  { key: 'adult', label: '어른' },
  { key: 'teen', label: '청소년' },
  { key: 'child', label: '어린이' },
] satisfies { key: keyof ReservationGuestCounts; label: string }[]

export const formatReservationGuests = (guests: ReservationGuestCounts) => {
  const guestTexts = GUEST_LABELS.filter(({ key }) => guests[key] > 0).map(
    ({ key, label }) => `${label} ${guests[key]}명`,
  )

  if (guestTexts.length === 0) {
    return '0명'
  }

  return guestTexts.join(', ')
}
