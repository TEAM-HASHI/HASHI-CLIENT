import { beforeEach, expect, it, vi } from 'vitest'

import {
  getMapRestaurantSaveCounts,
  getMyMapRestaurantSaves,
} from '@/pages/map/api/getMapRestaurantSaves'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))
const mockedRequest = vi.mocked(request)
beforeEach(() => {
  mockedRequest.mockReset()
})

it('deduplicates and batches up to 100 IDs with no-store and one abort signal', async () => {
  const signal = new AbortController().signal
  mockedRequest.mockImplementation(async (_path, options) => {
    const ids = (
      options?.searchParams as { restaurantIds: string }
    ).restaurantIds
      .split(',')
      .map(Number)
    return {
      restaurants: ids.reverse().map((restaurantId) => ({
        restaurantId,
        saveCount: restaurantId + 10,
      })),
    }
  })
  const counts = await getMapRestaurantSaveCounts(
    [...Array.from({ length: 201 }, (_, index) => index + 1), 1, 101],
    signal,
  )
  expect(counts[1]).toBe(11)
  expect(counts[101]).toBe(111)
  expect(counts[201]).toBe(211)
  expect(Object.keys(counts)).toHaveLength(201)
  expect(mockedRequest).toHaveBeenCalledTimes(3)
  expect(
    mockedRequest.mock.calls.map(
      ([, options]) =>
        (
          options?.searchParams as { restaurantIds: string }
        ).restaurantIds.split(',').length,
    ),
  ).toEqual([100, 100, 1])
  for (const [path, options] of mockedRequest.mock.calls) {
    expect(path).toBe('/api/v1/restaurants/save-counts')
    expect(options).toMatchObject({ cache: 'no-store', signal })
  }
})

it('joins shuffled rows by ID and leaves omitted public counts unknown', async () => {
  mockedRequest.mockResolvedValueOnce({
    restaurants: [
      { restaurantId: 30, saveCount: 0 },
      { restaurantId: 10, saveCount: 8 },
    ],
  })
  await expect(getMapRestaurantSaveCounts([10, 20, 30])).resolves.toEqual({
    10: 8,
    30: 0,
  })
  mockedRequest.mockResolvedValueOnce({
    restaurants: [
      { restaurantId: 30, saved: false },
      { restaurantId: 10, saved: true },
    ],
  })
  await expect(getMyMapRestaurantSaves([10, 20, 30])).resolves.toEqual({
    10: true,
    30: false,
  })
  expect(mockedRequest).toHaveBeenLastCalledWith(
    '/api/v1/users/me/restaurant-saves',
    {
      searchParams: { restaurantIds: '10,20,30' },
      cache: 'no-store',
      signal: undefined,
    },
  )
})

it('does not request an empty ID batch', async () => {
  await expect(getMapRestaurantSaveCounts([])).resolves.toEqual({})
  await expect(getMyMapRestaurantSaves([])).resolves.toEqual({})
  expect(mockedRequest).not.toHaveBeenCalled()
})

it.each([0, -1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1])(
  'rejects unsafe ID %j before any requests',
  async (id) => {
    await expect(getMapRestaurantSaveCounts([10, id])).rejects.toThrow()
    expect(mockedRequest).not.toHaveBeenCalled()
  },
)

it.each([
  null,
  {},
  { restaurants: null },
  { restaurants: [null] },
  { restaurants: [{ restaurantId: 999, saveCount: 1 }] },
  { restaurants: [{ restaurantId: 10, saveCount: -1 }] },
  { restaurants: [{ restaurantId: 10, saveCount: 1.5 }] },
  { restaurants: [{ restaurantId: 10 }] },
  {
    restaurants: [
      { restaurantId: 10, saveCount: 1 },
      { restaurantId: 10, saveCount: 2 },
    ],
  },
])('rejects malformed count rows %j', async (response) => {
  mockedRequest.mockResolvedValueOnce(response)
  await expect(getMapRestaurantSaveCounts([10])).rejects.toThrow()
})

it('rejects a nonboolean saved state', async () => {
  mockedRequest.mockResolvedValueOnce({
    restaurants: [{ restaurantId: 10, saved: 'true' }],
  })
  await expect(getMyMapRestaurantSaves([10])).rejects.toThrow()
})

it('propagates cancellation instead of returning fabricated empty results', async () => {
  const controller = new AbortController()
  controller.abort()
  mockedRequest.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'))
  await expect(
    getMapRestaurantSaveCounts([10], controller.signal),
  ).rejects.toMatchObject({ name: 'AbortError' })
})
