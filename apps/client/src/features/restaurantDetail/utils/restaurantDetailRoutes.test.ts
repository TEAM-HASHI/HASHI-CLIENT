import { describe, expect, it } from 'vitest'

import {
  getRestaurantDetailPath,
  getRestaurantMenuDetailPath,
  getRestaurantReservationNewPath,
  getRestaurantReviewNewPath,
} from '@/features/restaurantDetail/utils/restaurantDetailRoutes'

describe('restaurantDetailRoutes', () => {
  it('encodes a raw restaurant id as a path parameter', () => {
    expect(getRestaurantDetailPath('tokyo/sushi 한글')).toBe(
      '/restaurants/tokyo%2Fsushi%20%ED%95%9C%EA%B8%80',
    )
  })

  it('encodes every parameter in a menu detail path', () => {
    expect(getRestaurantMenuDetailPath('tokyo/sushi', 'menu?1')).toBe(
      '/restaurants/tokyo%2Fsushi/menus/menu%3F1',
    )
  })

  it('keeps reservation and review query path generation consistent', () => {
    expect(getRestaurantReservationNewPath('tokyo/sushi')).toBe(
      '/restaurants/tokyo%2Fsushi/reservations/new',
    )
    expect(getRestaurantReviewNewPath('tokyo/sushi', 'reservation/1')).toBe(
      '/restaurants/tokyo%2Fsushi/reviews/new?reservationId=reservation%2F1',
    )
  })
})
