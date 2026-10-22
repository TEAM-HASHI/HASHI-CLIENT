import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getMyRestaurantSaved,
  getRestaurantSaveCount,
} from '@/features/restaurantDetail/api/getRestaurantSaveSummary'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))
const mockedRequest = vi.mocked(request)

beforeEach(() => mockedRequest.mockReset())

describe('restaurant save summary contract', () => {
  it('reads the matching count and saved state with cancellation', async () => {
    const signal = new AbortController().signal
    mockedRequest.mockResolvedValueOnce({
      restaurants: [{ restaurantId: 10, saveCount: 0 }],
    })
    await expect(getRestaurantSaveCount(10, signal)).resolves.toBe(0)
    expect(mockedRequest).toHaveBeenLastCalledWith(
      '/api/v1/restaurants/save-counts',
      { searchParams: { restaurantIds: '10' }, signal },
    )
    mockedRequest.mockResolvedValueOnce({
      restaurants: [{ restaurantId: 10, saved: false }],
    })
    await expect(getMyRestaurantSaved(10, signal)).resolves.toBe(false)
    expect(mockedRequest).toHaveBeenLastCalledWith(
      '/api/v1/users/me/restaurant-saves',
      { searchParams: { restaurantIds: '10' }, signal },
    )
  })

  it('does not invent a count for an omitted restaurant', async () => {
    mockedRequest.mockResolvedValue({ restaurants: [] })
    await expect(getRestaurantSaveCount(10)).resolves.toBeUndefined()
    await expect(getMyRestaurantSaved(10)).resolves.toBe(false)
  })

  it.each([
    null,
    {},
    { restaurants: null },
    { restaurants: [null] },
    { restaurants: [{ restaurantId: 20, saveCount: 3 }] },
    { restaurants: [{ restaurantId: 10 }] },
    ...[-1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1, '3', null].map(
      (saveCount) => ({ restaurants: [{ restaurantId: 10, saveCount }] }),
    ),
  ])('rejects invalid count responses: %j', async (response) => {
    mockedRequest.mockResolvedValue(response)
    await expect(getRestaurantSaveCount(10)).rejects.toThrow()
  })

  it.each([undefined, null, 0, 'true'])(
    'rejects nonboolean saved: %j',
    async (saved) => {
      mockedRequest.mockResolvedValue({
        restaurants: [{ restaurantId: 10, saved }],
      })
      await expect(getMyRestaurantSaved(10)).rejects.toThrow()
    },
  )

  it.each([0, -1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1])(
    'rejects unsafe restaurant id %j before requesting',
    async (id) => {
      await expect(getRestaurantSaveCount(id)).rejects.toThrow()
      await expect(getMyRestaurantSaved(id)).rejects.toThrow()
      expect(mockedRequest).not.toHaveBeenCalled()
    },
  )
})
