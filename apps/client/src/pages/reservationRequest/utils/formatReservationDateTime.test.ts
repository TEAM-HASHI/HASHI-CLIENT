import { describe, expect, it } from 'vitest'

import { formatReservationDateTime } from '@/pages/reservationRequest/utils/formatReservationDateTime'

describe('formatReservationDateTime', () => {
  it('keeps a timezone-less reservation date and time unchanged', () => {
    expect(
      formatReservationDateTime({
        date: '2026-06-28',
        time: '23:30',
      }),
    ).toBe('2026.6.28. 23:30')
  })
})
