import { describe, expect, it } from 'vitest'

import { createSearchRestaurantsRequestParams } from '@/pages/search/utils/searchRestaurantParams'

describe('createSearchRestaurantsRequestParams', () => {
  it('omits unsupported default sort from the restaurant request', () => {
    expect(
      createSearchRestaurantsRequestParams({
        category: 'all',
        keyword: '라멘',
        sort: 'default',
      }),
    ).toEqual({
      genre: 'all',
      keyword: '라멘',
      size: 10,
    })
  })

  it('maps page filter values to restaurant API values', () => {
    expect(
      createSearchRestaurantsRequestParams({
        category: 'sushiSashimi',
        keyword: '스시',
        sort: 'rating',
      }),
    ).toEqual({
      genre: 'sushi',
      keyword: '스시',
      size: 10,
      sort: 'rating',
    })
  })
})
