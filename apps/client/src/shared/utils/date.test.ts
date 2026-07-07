import { describe, expect, it } from 'vitest'

import {
  checkIsTodayOrBefore,
  createDayStart,
  createMonthStart,
  formatDateToLocalDateString,
} from '@/shared/utils/date'

describe('date utils', () => {
  it('creates date and month starts in local time', () => {
    expect(createDayStart(new Date(2026, 5, 15, 13, 30))).toEqual(
      new Date(2026, 5, 15),
    )
    expect(createMonthStart(new Date(2026, 5, 15, 13, 30))).toEqual(
      new Date(2026, 5, 1),
    )
  })

  it('checks today and previous dates by local day', () => {
    const today = new Date(2026, 5, 15, 13, 30)

    expect(checkIsTodayOrBefore(new Date(2026, 5, 14, 23, 59), today)).toBe(
      true,
    )
    expect(checkIsTodayOrBefore(new Date(2026, 5, 15, 0, 1), today)).toBe(true)
    expect(checkIsTodayOrBefore(new Date(2026, 5, 16), today)).toBe(false)
  })

  it('formats a date to a local YYYY-MM-DD string', () => {
    expect(formatDateToLocalDateString(new Date(2026, 0, 5, 23, 59))).toBe(
      '2026-01-05',
    )
  })
})
