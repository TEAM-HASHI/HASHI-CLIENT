import { describe, expect, it } from 'vitest'
import { adminQueryKeys } from '@/shared/api/queryKeys'

describe('adminQueryKeys', () => {
  it('includes every reservation list parameter', () => {
    const params = { page: 1, size: 20, status: 'REQUESTED' as const }

    expect(adminQueryKeys.reservations.list(params)).toEqual([
      'admin',
      'reservations',
      'list',
      params,
    ])
  })

  it('provides stable prefixes for list invalidation and user lookup', () => {
    expect(adminQueryKeys.reservations.lists()).toEqual([
      'admin',
      'reservations',
      'list',
    ])
    expect(adminQueryKeys.reservations.user(3)).toEqual([
      'admin',
      'reservations',
      'user',
      3,
    ])
  })
})
