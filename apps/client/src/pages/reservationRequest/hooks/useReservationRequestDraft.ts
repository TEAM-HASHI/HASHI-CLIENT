import { useLocation } from 'react-router-dom'

type GuestType = 'adult' | 'teen' | 'child'

export type ReservationGuestCounts = Record<GuestType, number>

export interface ReservationRequestDraft {
  restaurantId: string
  restaurantName: string
  guestName: string
  guests: ReservationGuestCounts
  date: string
  time: string
  requestNote: string
}

const FALLBACK_RESERVATION_DRAFT = {
  restaurantId: 'default',
  restaurantName: '야키니쿠 리키마루 이케부쿠로 히가시구치 텐',
  guestName: '김하시',
  guests: {
    adult: 2,
    teen: 0,
    child: 0,
  },
  date: '2026-06-01',
  time: '11:00',
  requestNote: '',
} satisfies ReservationRequestDraft

const checkIsRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const checkIsNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value)
}

const checkIsReservationGuestCounts = (
  value: unknown,
): value is ReservationGuestCounts => {
  if (!checkIsRecord(value)) {
    return false
  }

  return (
    checkIsNumber(value.adult) &&
    checkIsNumber(value.teen) &&
    checkIsNumber(value.child)
  )
}

const checkIsReservationRequestDraft = (
  value: unknown,
): value is ReservationRequestDraft => {
  if (!checkIsRecord(value)) {
    return false
  }

  return (
    typeof value.restaurantId === 'string' &&
    typeof value.restaurantName === 'string' &&
    typeof value.guestName === 'string' &&
    checkIsReservationGuestCounts(value.guests) &&
    typeof value.date === 'string' &&
    typeof value.time === 'string' &&
    typeof value.requestNote === 'string'
  )
}

export const useReservationRequestDraft = () => {
  const location = useLocation()

  if (checkIsReservationRequestDraft(location.state)) {
    return location.state
  }

  return FALLBACK_RESERVATION_DRAFT
}
