import { describe, expect, it } from 'vitest'

import {
  getRestaurantDetailPath,
  getRestaurantMenuDetailPath,
  getRestaurantReservationNewPath,
  getRestaurantReviewNewPath,
} from '@/app/router/routePaths'

describe('routePaths', () => {
  it('creates an encoded restaurant detail path from a raw id', () => {
    expect(getRestaurantDetailPath('tokyo/sushi 한글')).toBe(
      '/restaurants/tokyo%2Fsushi%20%ED%95%9C%EA%B8%80',
    )
  })

  it('creates an encoded restaurant menu detail path from raw ids', () => {
    expect(getRestaurantMenuDetailPath('tokyo/sushi', 'menu?1')).toBe(
      '/restaurants/tokyo%2Fsushi/menus/menu%3F1',
    )
  })

  it('creates reservation and review paths from raw ids', () => {
    expect(getRestaurantReservationNewPath('tokyo/sushi')).toBe(
      '/restaurants/tokyo%2Fsushi/reservations/new',
    )
    expect(getRestaurantReviewNewPath('tokyo/sushi', 'reservation/1')).toBe(
      '/restaurants/tokyo%2Fsushi/reviews/new?reservationId=reservation%2F1',
    )
  })
})
