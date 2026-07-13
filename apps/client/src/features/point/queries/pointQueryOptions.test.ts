import { describe, expect, it, vi } from 'vitest'

import { pointQueryKeys } from '@/features/point/queries/pointQueryKeys'
import { myPointBalanceQueryOptions } from '@/features/point/queries/pointQueryOptions'

vi.mock('@/features/point/api/getMyPointBalance', () => ({
  getMyPointBalance: vi.fn(),
}))

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
