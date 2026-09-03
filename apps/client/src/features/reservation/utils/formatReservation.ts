import {
  RESERVATION_GUEST_COUNTERS,
  type ReservationGuestCounts,
} from '@/features/reservation/constants/guest'
import { formatDotDateTime, formatMonthDay } from '@/shared/utils'

interface FormatReservationDraftDateTimeParams {
  date: string
  time: string
}

export const formatReservationGuestSummary = (
  guests: ReservationGuestCounts,
) => {
  const guestTexts = RESERVATION_GUEST_COUNTERS.filter(
    ({ key }) => guests[key] > 0,
  ).map(({ key, label }) => `${label} ${guests[key]}명`)

  return guestTexts.length > 0 ? guestTexts.join(', ') : null
}

const createReservationDate = (value: string | undefined) => {
  return value ? new Date(value) : null
}

export const formatReservationDate = (value: string | undefined) => {
  const date = createReservationDate(value)

  if (!date) {
    return null
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}.${month}.${day}`
}

export const formatReservationDateTime = (value: string | undefined) => {
  const date = createReservationDate(value)

  return date ? formatDotDateTime(date) : null
}

export const formatReservationMonthDay = (value: string | undefined) => {
  const date = createReservationDate(value)

  return date ? formatMonthDay(date) : null
}

export const formatReservationDraftDateTime = ({
  date,
  time,
}: FormatReservationDraftDateTimeParams) => {
  const [year, month, day] = date.split('-').map(Number)

  if (!year || !month || !day) {
    return `${date} ${time}`
  }

  return `${year}.${month}.${day}. ${time}`
}
