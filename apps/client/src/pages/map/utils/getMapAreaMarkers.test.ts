import { describe, expect, it } from 'vitest'

import { getMapAreaMarkers } from '@/pages/map/utils/getMapAreaMarkers'

describe('getMapAreaMarkers', () => {
  const areas = Object.freeze([
    Object.freeze({ code: 'a', name: 'A', position: { lat: 10, lng: 20 } }),
    Object.freeze({ code: 'b', name: 'B', position: { lat: 30, lng: 40 } }),
  ])

  it('counts only matching restaurants and keeps empty areas', () => {
    const restaurants = Object.freeze([
      { areaCode: 'a' },
      { areaCode: 'a' },
      { areaCode: 'unknown' },
    ])
    expect(getMapAreaMarkers(areas, restaurants)).toEqual([
      {
        code: 'a',
        name: 'A',
        position: { lat: 10, lng: 20 },
        restaurantCount: 2,
      },
      {
        code: 'b',
        name: 'B',
        position: { lat: 30, lng: 40 },
        restaurantCount: 0,
      },
    ])
    expect(areas[0]).not.toHaveProperty('restaurantCount')
    expect(restaurants).toHaveLength(3)
  })

  it('recomputes from replacement input, including an empty restaurant list', () => {
    expect(
      getMapAreaMarkers(areas, [{ areaCode: 'b' }]).map(
        ({ restaurantCount }) => restaurantCount,
      ),
    ).toEqual([0, 1])
    expect(
      getMapAreaMarkers(areas, []).map(
        ({ restaurantCount }) => restaurantCount,
      ),
    ).toEqual([0, 0])
    expect(getMapAreaMarkers([], [{ areaCode: 'a' }])).toEqual([])
  })
})
