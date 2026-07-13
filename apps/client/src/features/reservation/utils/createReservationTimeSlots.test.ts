import { describe, expect, it } from 'vitest'

import { createReservationTimeSlots } from '@/features/reservation/utils/createReservationTimeSlots'

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

  it('excludes time slots inside the restaurant break', () => {
    expect(
      createReservationTimeSlots(
        {
          open: '12:00',
          close: '18:00',
          breakStart: '15:00',
          breakEnd: '16:00',
        },
        30,
      ),
    ).toEqual([
      '12:00',
      '12:30',
      '13:00',
      '13:30',
      '14:00',
      '14:30',
      '16:00',
      '16:30',
      '17:00',
      '17:30',
      '18:00',
    ])
  })
})
