import { describe, expect, it } from 'vitest'

import { createReservationTimeSlots } from '@/pages/restaurantReservationNew/utils/createReservationTimeSlots'

describe('createReservationTimeSlots', () => {
  it('creates time slots by the given interval and includes the close time', () => {
    expect(
      createReservationTimeSlots({ open: '11:00', close: '12:00' }, 30),
    ).toEqual(['11:00', '11:30', '12:00'])
  })

  it('creates 30-minute reservation slots for restaurant business hours', () => {
    const slots = createReservationTimeSlots(
      { open: '11:00', close: '20:00' },
      30,
    )

    expect(slots[0]).toBe('11:00')
    expect(slots[1]).toBe('11:30')
    expect(slots.at(-1)).toBe('20:00')
  })
})
