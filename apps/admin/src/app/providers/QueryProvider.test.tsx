import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { queryClient } from '@/shared/lib/queryClient'
import { clearAdminSession, setAdminSession } from '@/shared/auth/adminSession'

const adminUsersQueryKey = [
  'admin',
  'users',
  'list',
  { page: 0, size: 20, sort: 'CREATED_AT' },
] as const

describe('QueryProvider', () => {
  beforeEach(() => {
    queryClient.clear()
    clearAdminSession()
  })

  afterEach(() => {
    queryClient.clear()
    clearAdminSession()
  })

  it('clears cached admin data when the active session is invalidated', () => {
    setAdminSession({
      accessToken: 'admin-access-token',
      issuedAt: '2026-07-21T00:00:00Z',
      loginId: 'hashi-admin',
    })
    const view = render(
      <QueryProvider>
        <div />
      </QueryProvider>,
    )
    const cachedUsers = {
      totalCount: 1,
      users: [{ email: 'admin@example.com', userId: 1 }],
    }

    queryClient.setQueryData(adminUsersQueryKey, cachedUsers)

    act(() => clearAdminSession())

    expect(queryClient.getQueryData(adminUsersQueryKey)).toBeUndefined()

    view.unmount()
  })
})
