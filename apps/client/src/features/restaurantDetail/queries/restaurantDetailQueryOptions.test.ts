import { describe, expect, it } from 'vitest'

import { restaurantDetailQueryKeys } from '@/features/restaurantDetail/queries/restaurantDetailQueryKeys'
import {
  restaurantMainQueryOptions,
  restaurantStoreInformationQueryOptions,
} from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'

describe('restaurantDetailQueryOptions', () => {
  it('creates hierarchical restaurant detail prefixes', () => {
    expect(restaurantDetailQueryKeys.all).toEqual(['restaurants'])
    expect(restaurantDetailQueryKeys.details()).toEqual([
      'restaurants',
      'detail',
    ])
    expect(restaurantDetailQueryKeys.detail(10)).toEqual([
      'restaurants',
      'detail',
      10,
    ])
  })

  it('creates stable keys for each restaurant detail resource', () => {
    expect(restaurantDetailQueryKeys.main(10)).toEqual([
      'restaurants',
      'detail',
      10,
      'main',
    ])
    expect(restaurantDetailQueryKeys.storeInformation(10)).toEqual([
      'restaurants',
      'detail',
      10,
      'storeInformation',
    ])
  })

  it('uses the resource key in each query option', () => {
    expect(restaurantMainQueryOptions(10).queryKey).toEqual(
      restaurantDetailQueryKeys.main(10),
    )
    expect(restaurantStoreInformationQueryOptions(10).queryKey).toEqual(
      restaurantDetailQueryKeys.storeInformation(10),
    )
  })
})
