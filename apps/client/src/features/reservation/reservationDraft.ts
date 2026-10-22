import {
  ANYWHERE_RESTAURANT_NAME_MAX_LENGTH,
  ANYWHERE_RESTAURANT_ADDRESS_MAX_LENGTH,
} from '@/features/reservation/constants/anywhereReservation'

type GuestType = 'adult' | 'teen' | 'child'

export type ReservationGuestCounts = Record<GuestType, number>

interface ReservationRequestDraftBase {
  restaurantName: string
  guestName: string
  guests: ReservationGuestCounts
  date: string
  time: string
  requestNote?: string
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
    [value.adult, value.teen, value.child].every(
      (count) =>
        checkIsNumber(count) &&
        Number.isInteger(count) &&
        count >= 0 &&
        count <= 100,
    ) &&
    Number(value.adult) + Number(value.teen) + Number(value.child) > 0
  )
}

const checkIsTextWithinLimit = (
  value: unknown,
  maxLength: number,
): value is string =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.trim().length <= maxLength

const checkIsDate = (value: unknown): value is string => {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number(value.slice(0, 4)) < 1
  )
    return false
  const date = new Date(`${value}T00:00:00Z`)
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  )
}

const checkIsTime = (value: unknown): value is string =>
  typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)

const checkHasReservationRequestBaseFields = (
  value: Record<string, unknown>,
) => {
  return (
    typeof value.restaurantName === 'string' &&
    checkIsTextWithinLimit(value.guestName, 50) &&
    checkIsReservationGuestCounts(value.guests) &&
    checkIsDate(value.date) &&
    checkIsTime(value.time) &&
    (value.requestNote === undefined ||
      (typeof value.requestNote === 'string' &&
        value.requestNote.length <= 1_000))
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
    checkIsTextWithinLimit(
      value.restaurantName,
      ANYWHERE_RESTAURANT_NAME_MAX_LENGTH,
    ) &&
    checkIsTextWithinLimit(
      value.restaurantAddress,
      ANYWHERE_RESTAURANT_ADDRESS_MAX_LENGTH,
    ) &&
    checkHasReservationRequestBaseFields(value)
  )
}

export const checkIsReservationRequestDraft = (
  value: unknown,
): value is ReservationRequestDraft => {
  return (
    checkIsRestaurantReservationRequestDraft(value) ||
    checkIsAnywhereReservationRequestDraft(value)
  )
}
