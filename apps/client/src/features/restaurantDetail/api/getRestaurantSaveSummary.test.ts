import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMyRestaurantSaved } from '@/features/restaurantDetail/api/getRestaurantSaveSummary'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))
const mockedRequest = vi.mocked(request)

beforeEach(() => mockedRequest.mockReset())

describe('restaurant save summary contract', () => {
  it('reads the matching saved state with cancellation', async () => {
    const signal = new AbortController().signal
    mockedRequest.mockResolvedValueOnce({
      restaurants: [{ restaurantId: 10, saved: false }],
    })
    await expect(getMyRestaurantSaved(10, signal)).resolves.toBe(false)
    expect(mockedRequest).toHaveBeenLastCalledWith(
      '/api/v1/users/me/restaurant-saves',
      { searchParams: { restaurantIds: '10' }, signal },
    )
  })

  it('treats an omitted restaurant as not saved', async () => {
    mockedRequest.mockResolvedValue({ restaurants: [] })
    await expect(getMyRestaurantSaved(10)).resolves.toBe(false)
  })

  it.each([
    null,
    {},
    { restaurants: null },
    { restaurants: [null] },
    { restaurants: [{ restaurantId: 20, saved: true }] },
  ])('rejects invalid saved state responses: %j', async (response) => {
    mockedRequest.mockResolvedValue(response)
    await expect(getMyRestaurantSaved(10)).rejects.toThrow()
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
      await expect(getMyRestaurantSaved(id)).rejects.toThrow()
      expect(mockedRequest).not.toHaveBeenCalled()
    },
  )
})
