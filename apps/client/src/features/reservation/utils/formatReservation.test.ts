import { describe, expect, it } from 'vitest'

import {
  formatReservationDate,
  formatReservationDateTime,
  formatReservationDraftDateTime,
  formatReservationGuestSummary,
  formatReservationMonthDay,
} from '@/features/reservation/utils/formatReservation'

describe('formatReservation', () => {
  it('formats non-zero reservation guest counts in domain order', () => {
    expect(formatReservationGuestSummary({ adult: 2, teen: 1, child: 0 })).toBe(
      '어른 2명, 청소년 1명',
    )
  })

  it('returns null when every reservation guest count is zero', () => {
    expect(
      formatReservationGuestSummary({ adult: 0, teen: 0, child: 0 }),
    ).toBeNull()
  })

  it('formats an API reservation date for each display precision', () => {
    const value = '2026-06-01T11:05:00'

    expect(formatReservationDate(value)).toBe('2026.6.1')
    expect(formatReservationDateTime(value)).toBe('2026.6.1. 11:05')
    expect(formatReservationMonthDay(value)).toBe('6월 1일')
  })

  it('returns an empty result when an API reservation date is missing', () => {
    expect(formatReservationDate(undefined)).toBeNull()
    expect(formatReservationDateTime(undefined)).toBeNull()
    expect(formatReservationMonthDay(undefined)).toBeNull()
  })

  it('returns null when an API reservation date is invalid', () => {
    const value = 'invalid-date'

    expect(formatReservationDate(value)).toBeNull()
    expect(formatReservationDateTime(value)).toBeNull()
    expect(formatReservationMonthDay(value)).toBeNull()
  })

  it('formats a reservation draft date and time', () => {
    expect(
      formatReservationDraftDateTime({
        date: '2026-06-01',
        time: '11:05',
      }),
    ).toBe('2026.6.1. 11:05')
  })

  it('keeps an invalid reservation draft date unchanged', () => {
    expect(
      formatReservationDraftDateTime({
        date: '날짜 미정',
        time: '11:05',
      }),
    ).toBe('날짜 미정 11:05')
  })
})
