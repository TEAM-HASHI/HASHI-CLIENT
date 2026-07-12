import { describe, expect, it } from 'vitest'
import { magazineQueryKeys } from '@/pages/magazines/queries/magazineQueryKeys'

describe('magazineQueryKeys', () => {
  it('includes cursor list params in the key', () => {
    const params = { size: 20 }

    expect(magazineQueryKeys.list(params)).toEqual([
      'admin',
      'magazine-catalog',
      'list',
      params,
    ])
  })
})
