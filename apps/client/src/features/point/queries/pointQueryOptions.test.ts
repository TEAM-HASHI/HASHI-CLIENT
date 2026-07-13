import { describe, expect, it } from 'vitest'

import { pointQueryKeys } from '@/features/point/queries/pointQueryKeys'
import { myPointBalanceQueryOptions } from '@/features/point/queries/pointQueryOptions'

describe('myPointBalanceQueryOptions', () => {
  it('creates point keys from the domain factory', () => {
    expect(pointQueryKeys.all).toEqual(['point'])
    expect(pointQueryKeys.myBalance()).toEqual(['point', 'myBalance'])
  })

  it('uses the point balance factory key', () => {
    expect(myPointBalanceQueryOptions.queryKey).toEqual(
      pointQueryKeys.myBalance(),
    )
  })
})
