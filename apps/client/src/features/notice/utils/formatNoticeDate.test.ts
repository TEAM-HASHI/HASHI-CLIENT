import { describe, expect, it } from 'vitest'

import { formatNoticeDate } from '@/features/notice/utils/formatNoticeDate'

describe('formatNoticeDate', () => {
  it('formats an ISO date or date-time as YYYY.MM.DD', () => {
    expect(formatNoticeDate('2026-09-06T10:00:00')).toBe('2026.09.06')
    expect(formatNoticeDate('2026-09-01')).toBe('2026.09.01')
  })

  it('returns an empty string for an unparseable value', () => {
    expect(formatNoticeDate('invalid')).toBe('')
  })
})
