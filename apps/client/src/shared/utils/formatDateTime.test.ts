import { describe, expect, it } from 'vitest'

import { formatDotDateTime, formatMonthDayTime } from './formatDateTime'

describe('formatDateTime', () => {
  it('formats month, day, and time with Korean date units', () => {
    const date = new Date(2026, 5, 21, 13, 44)

    expect(formatMonthDayTime(date)).toBe('6월 21일 13:44')
  })

  it('formats full date and time with dot-separated date', () => {
    const date = new Date(2026, 5, 1, 11, 0)

    expect(formatDotDateTime(date)).toBe('2026.6.1. 11:00')
  })

  it('pads hour and minute to two digits', () => {
    const date = new Date(2026, 0, 3, 9, 5)

    expect(formatMonthDayTime(date)).toBe('1월 3일 09:05')
    expect(formatDotDateTime(date)).toBe('2026.1.3. 09:05')
  })
})
