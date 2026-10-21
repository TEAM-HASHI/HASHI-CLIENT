import { describe, expect, it } from 'vitest'
import { collectionMocks } from '@/pages/saved/data/collectionMocks'
import {
  deleteCollection,
  removeRestaurants,
  moveRestaurants,
  getMoveSummary,
  getSavedRestaurantIds,
} from '@/pages/saved/utils/collectionManagement'

describe('컬렉션 관리', () => {
  it('단일 중복 이동은 변경하지 않고 여러 이동은 중복을 원래 컬렉션에 유지한다', () => {
    const source = collectionMocks.collections[0]
    const ids = source.restaurants.slice(0, 2).map((r) => r.restaurantId)
    const data = {
      ...collectionMocks,
      collections: [
        source,
        {
          ...collectionMocks.collections[1],
          restaurants: [source.restaurants[0]],
        },
      ],
    }
    const target = data.collections[1].id
    expect(moveRestaurants(data, source.id, target, [ids[0]], 'now')).toBe(data)
    expect(getMoveSummary(data, source.id, target, ids)).toEqual({
      movable: [ids[1]],
      duplicate: [ids[0]],
    })
    const moved = moveRestaurants(data, source.id, target, ids, 'now')
    expect(
      moved.collections[0].restaurants.some((r) => r.restaurantId === ids[0]),
    ).toBe(true)
    expect(
      moved.collections[0].restaurants.some((r) => r.restaurantId === ids[1]),
    ).toBe(false)
    expect(moved.collections[1].restaurants).toHaveLength(2)
    expect(getSavedRestaurantIds(moved)).toEqual(getSavedRestaurantIds(data))
    expect(moveRestaurants(data, source.id, source.id, ids, 'now')).toBe(data)
  })
  it('마지막 저장 관계만 제거되며 식당 원본은 보존한다', () => {
    const source = collectionMocks.collections[0]
    const id = source.restaurants[0].restaurantId
    const data = {
      ...collectionMocks,
      collections: [
        source,
        {
          ...collectionMocks.collections[1],
          restaurants: [source.restaurants[0]],
        },
      ],
    }
    const removed = removeRestaurants(data, source.id, [id])
    expect(getSavedRestaurantIds(removed)).toContain(id)
    const deleted = deleteCollection(removed, data.collections[1].id)
    expect(getSavedRestaurantIds(deleted)).not.toContain(id)
    expect(deleted.restaurants).toBe(data.restaurants)
    expect(data.collections[0].restaurants).toBe(source.restaurants)
  })
})
