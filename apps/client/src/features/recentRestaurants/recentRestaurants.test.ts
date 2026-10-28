import { afterEach, expect, it, vi } from 'vitest'
import {
  getRecentRestaurants,
  saveRecentRestaurant,
  removeRecentRestaurants,
  clearRecentRestaurants,
} from '@/features/recentRestaurants/recentRestaurants'

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

it('caps history at ten, moves a revisited restaurant first, and preserves other entries on removal', () => {
  for (let id = 1; id <= 11; id++)
    saveRecentRestaurant({ id, name: `식당 ${id}` })
  saveRecentRestaurant({ id: 5, name: '변경된 이름' })
  expect(getRecentRestaurants().map(({ id }) => id)).toEqual([
    5, 11, 10, 9, 8, 7, 6, 4, 3, 2,
  ])
  expect(getRecentRestaurants()[0].name).toBe('변경된 이름')
  removeRecentRestaurants([5, 10])
  expect(getRecentRestaurants().map(({ id }) => id)).toEqual([
    11, 9, 8, 7, 6, 4, 3, 2,
  ])
})

it('ignores malformed stored values and does not throw when storage is unavailable', () => {
  localStorage.setItem('hashi:search:recent-restaurants', '{broken')
  expect(getRecentRestaurants()).toEqual([])
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('full')
  })
  expect(() => saveRecentRestaurant({ id: 1, name: '식당' })).not.toThrow()
  expect(() => removeRecentRestaurants([1])).not.toThrow()
  expect(() => clearRecentRestaurants()).not.toThrow()
  expect(getRecentRestaurants()).toEqual([])
})
