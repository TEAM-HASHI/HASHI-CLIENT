import { describe, expect, it } from 'vitest'
import { userQueryKeys } from '@/pages/users/queries/userQueryKeys'

describe('userQueryKeys', () => {
  it('includes every member list parameter', () => {
    const params = {
      sort: 'CREATED_AT' as const,
      keyword: '더미',
      page: 2,
      size: 20,
    }

    expect(userQueryKeys.list(params)).toEqual([
      'admin',
      'users',
      'list',
      params,
    ])
  })

  it('provides a stable member-list prefix', () => {
    expect(userQueryKeys.lists()).toEqual(['admin', 'users', 'list'])
  })
})
