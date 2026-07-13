import { useLocation } from 'react-router-dom'

type GuestType = 'adult' | 'teen' | 'child'

export type ReservationGuestCounts = Record<GuestType, number>

interface ReservationRequestDraftBase {
  restaurantName: string
  guestName: string
  guests: ReservationGuestCounts
  date: string
  time: string
  requestNote: string
}

export type RestaurantReservationRequestDraft = ReservationRequestDraftBase & {
  source?: 'restaurant'
  restaurantId: string
  restaurantAddress: string
  restaurantImageUrl: string | null
  reservationFee: number
}

export type AnywhereReservationRequestDraft = ReservationRequestDraftBase & {
  source: 'anywhere'
  restaurantId: null
  restaurantAddress: string
  restaurantImageUrl: null
}

export type ReservationRequestDraft =
  | RestaurantReservationRequestDraft
  | AnywhereReservationRequestDraft

const checkIsRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const checkIsNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value)
}

const checkIsReservationGuestCounts = (
  value: unknown,
): value is ReservationGuestCounts => {
  return (
    checkIsRecord(value) &&
    checkIsNumber(value.adult) &&
    checkIsNumber(value.teen) &&
    checkIsNumber(value.child)
  )
}

const checkHasReservationRequestBaseFields = (
  value: Record<string, unknown>,
) => {
  return (
    typeof value.restaurantName === 'string' &&
    typeof value.guestName === 'string' &&
    checkIsReservationGuestCounts(value.guests) &&
    typeof value.date === 'string' &&
    typeof value.time === 'string' &&
    typeof value.requestNote === 'string'
  )
}

const checkIsNullableString = (value: unknown) => {
  return value === null || typeof value === 'string'
}

const checkIsRestaurantReservationRequestDraft = (
  value: unknown,
): value is RestaurantReservationRequestDraft => {
  const restaurantId = checkIsRecord(value)
    ? Number(value.restaurantId)
    : Number.NaN

  return (
    checkIsRecord(value) &&
    (value.source === undefined || value.source === 'restaurant') &&
    typeof value.restaurantId === 'string' &&
    Number.isSafeInteger(restaurantId) &&
    restaurantId > 0 &&
    checkHasReservationRequestBaseFields(value) &&
    typeof value.restaurantAddress === 'string' &&
    checkIsNullableString(value.restaurantImageUrl) &&
    checkIsNumber(value.reservationFee) &&
    value.reservationFee >= 0
  )
}

const checkIsAnywhereReservationRequestDraft = (
  value: unknown,
): value is AnywhereReservationRequestDraft => {
  return (
    checkIsRecord(value) &&
    value.source === 'anywhere' &&
    value.restaurantId === null &&
    typeof value.restaurantAddress === 'string' &&
    value.restaurantImageUrl === null &&
    checkHasReservationRequestBaseFields(value)
  )
}

const checkIsReservationRequestDraft = (
  value: unknown,
): value is ReservationRequestDraft => {
  return (
    checkIsRestaurantReservationRequestDraft(value) ||
    checkIsAnywhereReservationRequestDraft(value)
  )
}

export const useReservationRequestDraft = () => {
  const location = useLocation()

  if (checkIsReservationRequestDraft(location.state)) {
    return location.state
  }

  return null
}
