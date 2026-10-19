import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteCollection } from '@/pages/saved/api/deleteCollection'
import { moveSavedRestaurants } from '@/pages/saved/api/moveSavedRestaurants'
import { removeSavedRestaurants } from '@/pages/saved/api/removeSavedRestaurants'
import { saveRestaurant } from '@/pages/saved/api/saveRestaurant'

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }))
vi.mock('@/shared/api/request', () => ({ request: mockRequest }))

describe('collection management write contracts', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('saves one restaurant and returns the updated collection header', async () => {
    const detail = { collectionId: 42, savedCount: 3 }
    mockRequest.mockResolvedValue(detail)
    await expect(saveRestaurant(42, { restaurantId: 5 })).resolves.toBe(detail)
    expect(mockRequest).toHaveBeenCalledWith(
      '/api/v1/collections/42/restaurants',
      {
        method: 'post',
        json: { restaurantId: 5 },
      },
    )
  })

  it('removes saved relations using query parameters rather than a DELETE body', async () => {
    const detail = { collectionId: 42, savedCount: 1 }
    mockRequest.mockResolvedValue(detail)
    await expect(removeSavedRestaurants(42, [5, 6])).resolves.toBe(detail)
    expect(mockRequest).toHaveBeenCalledWith(
      '/api/v1/collections/42/restaurants',
      {
        method: 'delete',
        searchParams: { restaurantIds: '5,6' },
      },
    )
  })

  it('moves the specified IDs and preserves both updated headers', async () => {
    const result = {
      sourceCollection: { collectionId: 42, savedCount: 1 },
      targetCollection: { collectionId: 43, savedCount: 4 },
    }
    mockRequest.mockResolvedValue(result)
    const body = { targetCollectionId: 43, restaurantIds: [5, 6] }
    await expect(moveSavedRestaurants(42, body)).resolves.toEqual(result)
    expect(mockRequest).toHaveBeenCalledWith(
      '/api/v1/collections/42/restaurants/move',
      {
        method: 'post',
        json: body,
      },
    )
  })

  it('accepts a successful deletion without response data', async () => {
    mockRequest.mockResolvedValue(null)
    await expect(deleteCollection(42)).resolves.toBeUndefined()
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/collections/42', {
      method: 'delete',
    })
  })

  it('does not treat an atomic move conflict as partial success or retry it', async () => {
    const error = Object.assign(new Error('already saved'), {
      code: 'USER-012',
      status: 409,
    })
    mockRequest.mockRejectedValue(error)
    await expect(
      moveSavedRestaurants(42, {
        targetCollectionId: 43,
        restaurantIds: [5, 6],
      }),
    ).rejects.toBe(error)
    expect(mockRequest).toHaveBeenCalledTimes(1)
  })

  it('preserves remove and delete failures for the caller to keep current selection', async () => {
    const error = Object.assign(new Error('not saved'), {
      code: 'USER-013',
      status: 404,
    })
    mockRequest.mockRejectedValue(error)
    await expect(removeSavedRestaurants(42, [5])).rejects.toBe(error)
    await expect(deleteCollection(42)).rejects.toBe(error)
  })

  it('rejects a move response without both matching headers', async () => {
    mockRequest.mockResolvedValue({ sourceCollection: { collectionId: 42 } })
    await expect(
      moveSavedRestaurants(42, { targetCollectionId: 43, restaurantIds: [5] }),
    ).rejects.toThrow('response')
  })

  it('rejects invalid IDs and empty selections before writing', async () => {
    await expect(saveRestaurant(0, { restaurantId: 5 })).rejects.toThrow(
      'collectionId',
    )
    await expect(removeSavedRestaurants(42, [])).rejects.toThrow(
      'restaurantIds',
    )
    await expect(removeSavedRestaurants(42, [0])).rejects.toThrow(
      'restaurantIds',
    )
    await expect(
      moveSavedRestaurants(42, { targetCollectionId: 0, restaurantIds: [5] }),
    ).rejects.toThrow('collectionId')
    await expect(deleteCollection(0)).rejects.toThrow('collectionId')
    expect(mockRequest).not.toHaveBeenCalled()
  })
})
