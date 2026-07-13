import { describe, expect, it } from 'vitest'

import { createRestaurantListRequestParams } from '@/features/restaurantList/utils/createRestaurantListRequestParams'

describe('createRestaurantListRequestParams', () => {
  it('maps hashi pick default filters to restaurant list API params', () => {
    expect(
      createRestaurantListRequestParams({
        category: { label: '전체', value: 'all' },
        sort: { label: '기본순', value: 'default' },
        type: 'hashi-pick',
      }),
    ).toEqual({
      genre: 'all',
      size: 10,
      sort: 'basic',
      type: 'hashi-pick',
    })
  })

  it('normalizes rice bowl category and rating sort for popular restaurants', () => {
    expect(
      createRestaurantListRequestParams({
        category: { label: '덮밥류', value: 'riceBowl' },
        sort: { label: '별점순', value: 'rating' },
        type: 'popular',
      }),
    ).toEqual({
      genre: 'rice-bowl',
      size: 10,
      sort: 'rating',
      type: 'popular',
    })
  })
})
