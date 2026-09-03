import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getRestaurants } from '@/features/restaurantList/api/getRestaurants'
import {
  createReservationRescueRestaurants,
  fetchReservationRescueRestaurants,
} from '@/pages/reservationRescue/queries/reservationRescueQueryOptions'

vi.mock('@/features/restaurantList/api/getRestaurants', () => ({
  getRestaurants: vi.fn(),
}))

const mockedGetRestaurants = vi.mocked(getRestaurants)

const restaurantFixtures = [
  {
    restaurantId: 1,
    name: '긴자 사사키',
    rating: 4.9,
  },
  {
    restaurantId: 2,
    name: '취소한 식당',
    rating: 4.8,
  },
  {
    restaurantId: 3,
    name: '스시 아오이',
    rating: 4.7,
  },
  {
    restaurantId: 4,
    name: '쿠로다',
    rating: 4.6,
  },
  {
    restaurantId: 5,
    name: '다이닝 하시',
    rating: 4.5,
  },
]

describe('reservationRescueQueryOptions', () => {
  beforeEach(() => {
    mockedGetRestaurants.mockReset()
  })

  it('requests HASHI PICK restaurants in rating order', async () => {
    mockedGetRestaurants.mockResolvedValue({
      hasNext: false,
      nextCursor: undefined,
      restaurants: [],
    })

    await fetchReservationRescueRestaurants()

    expect(mockedGetRestaurants).toHaveBeenCalledWith({
      genre: 'all',
      size: 5,
      sort: 'rating',
      type: 'hashi-pick',
    })
  })

  it('excludes the canceled restaurant and returns at most three mapped results', () => {
    const restaurants = createReservationRescueRestaurants(
      restaurantFixtures,
      2,
    )

    expect(restaurants.map(({ id }) => id)).toEqual(['1', '3', '4'])
  })

  it('excludes responses that cannot be mapped to a restaurant', () => {
    const restaurants = createReservationRescueRestaurants(
      [{ name: '식당 ID가 없는 응답' }, ...restaurantFixtures],
      2,
    )

    expect(restaurants.map(({ id }) => id)).toEqual(['1', '3', '4'])
  })
})
