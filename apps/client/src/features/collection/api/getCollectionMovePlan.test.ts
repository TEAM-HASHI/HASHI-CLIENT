import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getSavedRestaurants } from '@/features/collection/api/getSavedRestaurants'
import { getCollectionMovePlan } from '@/features/collection/api/getCollectionMovePlan'

vi.mock('@/features/collection/api/getSavedRestaurants', () => ({
  getSavedRestaurants: vi.fn(),
}))

describe('collection move duplicate check', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('checks later pages before declaring a selected restaurant movable', async () => {
    vi.mocked(getSavedRestaurants)
      .mockResolvedValueOnce({
        content: [{ restaurantId: 2 }],
        hasNext: true,
        nextCursor: 'second',
      })
      .mockResolvedValueOnce({ content: [{ restaurantId: 5 }], hasNext: false })
    const signal = new AbortController().signal
    await expect(getCollectionMovePlan(43, [5, 6, 5], signal)).resolves.toEqual(
      { movableIds: [6], duplicateIds: [5] },
    )
    expect(getSavedRestaurants).toHaveBeenNthCalledWith(
      1,
      43,
      { sort: 'latest', size: 50 },
      signal,
    )
    expect(getSavedRestaurants).toHaveBeenNthCalledWith(
      2,
      43,
      { sort: 'latest', size: 50, cursor: 'second' },
      signal,
    )
  })

  it('can stop once every selected ID has been found as a duplicate', async () => {
    vi.mocked(getSavedRestaurants).mockResolvedValueOnce({
      content: [{ restaurantId: 5 }, { restaurantId: 6 }],
      hasNext: true,
      nextCursor: 'second',
    })
    await expect(getCollectionMovePlan(43, [5, 6])).resolves.toEqual({
      movableIds: [],
      duplicateIds: [5, 6],
    })
    expect(getSavedRestaurants).toHaveBeenCalledTimes(1)
  })

  it('fails the check if a later page fails instead of declaring the remaining IDs movable', async () => {
    const error = new Error('network failure')
    vi.mocked(getSavedRestaurants)
      .mockResolvedValueOnce({
        content: [],
        hasNext: true,
        nextCursor: 'second',
      })
      .mockRejectedValueOnce(error)
    await expect(getCollectionMovePlan(43, [5])).rejects.toBe(error)
  })

  it('rejects a multi-page cursor cycle rather than looping', async () => {
    vi.mocked(getSavedRestaurants)
      .mockResolvedValueOnce({ content: [], hasNext: true, nextCursor: 'a' })
      .mockResolvedValueOnce({ content: [], hasNext: true, nextCursor: 'b' })
      .mockResolvedValueOnce({ content: [], hasNext: true, nextCursor: 'a' })
    await expect(getCollectionMovePlan(43, [5])).rejects.toThrow('cursor')
    expect(getSavedRestaurants).toHaveBeenCalledTimes(3)
  })

  it('does not start a check with an already aborted signal', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(
      getCollectionMovePlan(43, [5], controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' })
    expect(getSavedRestaurants).not.toHaveBeenCalled()
  })

  it('rejects invalid selected IDs before reading a target', async () => {
    await expect(getCollectionMovePlan(43, [0])).rejects.toThrow(
      'restaurantIds',
    )
    expect(getSavedRestaurants).not.toHaveBeenCalled()
  })
})
