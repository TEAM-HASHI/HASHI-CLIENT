import { afterEach, expect, it } from 'vitest'

import {
  clearRestaurantListSnapshot,
  getRestaurantListSnapshot,
  saveRestaurantListScrollPosition,
} from '@/features/restaurantList/utils/restaurantListScrollRestoration'

afterEach(() => {
  Array.from({ length: 51 }, (_, index) => `retention-${index}`).forEach(
    clearRestaurantListSnapshot,
  )
})

it('bounds retained snapshots while preserving recently updated entries', () => {
  Array.from({ length: 50 }, (_, index) => index).forEach((index) => {
    saveRestaurantListScrollPosition(`retention-${index}`, index * 100, 2)
  })
  saveRestaurantListScrollPosition('retention-0', 999, 3)
  saveRestaurantListScrollPosition('retention-50', 5000, 5)

  expect(getRestaurantListSnapshot('retention-1')).toBeUndefined()
  expect(getRestaurantListSnapshot('retention-0')).toEqual({
    pageCount: 3,
    scrollTop: 999,
  })
  expect(getRestaurantListSnapshot('retention-50')).toEqual({
    pageCount: 5,
    scrollTop: 5000,
  })
})
