import { beforeEach, expect, it, vi } from 'vitest'

import {
  getRestaurantSaveCounts,
  getMyRestaurantSaves,
} from '@/features/collection/api/getRestaurantSaves'
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
  const counts = await getRestaurantSaveCounts(
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
  await expect(getRestaurantSaveCounts([10, 20, 30])).resolves.toEqual({
    10: 8,
    30: 0,
  })
  mockedRequest.mockResolvedValueOnce({
    restaurants: [
      { restaurantId: 30, saved: false },
      { restaurantId: 10, saved: true },
    ],
  })
  await expect(getMyRestaurantSaves([10, 20, 30])).resolves.toEqual({
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
  await expect(getRestaurantSaveCounts([])).resolves.toEqual({})
  await expect(getMyRestaurantSaves([])).resolves.toEqual({})
  expect(mockedRequest).not.toHaveBeenCalled()
})

it.each([0, -1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1])(
  'rejects unsafe ID %j before any requests',
  async (id) => {
    await expect(getRestaurantSaveCounts([10, id])).rejects.toThrow()
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
  ...[Infinity, Number.MAX_SAFE_INTEGER + 1, '3', null].map((saveCount) => ({
    restaurants: [{ restaurantId: 10, saveCount }],
  })),
  { restaurants: [{ restaurantId: 10 }] },
  {
    restaurants: [
      { restaurantId: 10, saveCount: 1 },
      { restaurantId: 10, saveCount: 2 },
    ],
  },
])('rejects malformed count rows %j', async (response) => {
  mockedRequest.mockResolvedValueOnce(response)
  await expect(getRestaurantSaveCounts([10])).rejects.toThrow()
})

it.each([undefined, null, 0, 'true'])(
  'rejects nonboolean saved: %j',
  async (saved) => {
    mockedRequest.mockResolvedValueOnce({
      restaurants: [{ restaurantId: 10, saved }],
    })
    await expect(getMyRestaurantSaves([10])).rejects.toThrow()
  },
)

it('propagates cancellation instead of returning fabricated empty results', async () => {
  const controller = new AbortController()
  controller.abort()
  mockedRequest.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'))
  await expect(
    getRestaurantSaveCounts([10], controller.signal),
  ).rejects.toMatchObject({ name: 'AbortError' })
})

it.each([getRestaurantSaveCounts, getMyRestaurantSaves])(
  'propagates a later batch failure without requesting remaining batches: %s',
  async (read) => {
    const error = new Error('Service unavailable')
    mockedRequest.mockResolvedValueOnce({ restaurants: [] })
    mockedRequest.mockRejectedValueOnce(error)
    await expect(
      read(Array.from({ length: 201 }, (_, index) => index + 1)),
    ).rejects.toBe(error)
    expect(mockedRequest).toHaveBeenCalledTimes(2)
  },
)

it.each([getRestaurantSaveCounts, getMyRestaurantSaves])(
  'rejects rows belonging to another batch: %s',
  async (read) => {
    mockedRequest.mockResolvedValueOnce({ restaurants: [] })
    mockedRequest.mockResolvedValueOnce({
      restaurants: [{ restaurantId: 1, saveCount: 3, saved: true }],
    })
    await expect(
      read(Array.from({ length: 101 }, (_, index) => index + 1)),
    ).rejects.toThrow()
    expect(mockedRequest).toHaveBeenCalledTimes(2)
  },
)
