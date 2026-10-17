import { describe, expect, it } from 'vitest'
import { checkIsReservationRequestDraft } from '@/features/reservation/reservationDraft'

const draft = {
  source: 'anywhere',
  restaurantId: null,
  restaurantName: '식당',
  restaurantAddress: '도쿄',
  restaurantImageUrl: null,
  guestName: '김하시',
  guests: { adult: 1, teen: 0, child: 0 },
  date: '2028-02-29',
  time: '23:59',
}

describe('reservation draft validation', () => {
  it('accepts valid restaurant and anywhere drafts including boundary values', () => {
    expect(checkIsReservationRequestDraft(draft)).toBe(true)
    expect(
      checkIsReservationRequestDraft({
        ...draft,
        guestName: '가'.repeat(50),
        guests: { adult: 100, teen: 100, child: 100 },
        restaurantName: '가'.repeat(200),
        restaurantAddress: '가'.repeat(200),
        requestNote: '가'.repeat(1000),
      }),
    ).toBe(true)
    expect(
      checkIsReservationRequestDraft({
        ...draft,
        source: 'restaurant',
        restaurantId: '1',
        reservationFee: 4000,
      }),
    ).toBe(true)
  })
  it.each([
    { guestName: ' ' },
    { guestName: '가'.repeat(51) },
    ...[-1, 1.5, 101, NaN, Infinity].map((adult) => ({
      guests: { adult, teen: 0, child: 0 },
    })),
    { guests: { adult: 0, teen: 0, child: 0 } },
    ...['2027-02-29', '2026-02-31', '2026-13-01', '2026-1-01', 'invalid'].map(
      (date) => ({ date }),
    ),
    ...['24:00', '12:60', '9:00', 'invalid'].map((time) => ({ time })),
    { requestNote: '가'.repeat(1001) },
    { restaurantName: ' ' },
    { restaurantName: '가'.repeat(201) },
    { restaurantAddress: ' ' },
    { restaurantAddress: '가'.repeat(201) },
  ])('rejects invalid draft fields: %j', (overrides) => {
    expect(checkIsReservationRequestDraft({ ...draft, ...overrides })).toBe(
      false,
    )
  })
})
