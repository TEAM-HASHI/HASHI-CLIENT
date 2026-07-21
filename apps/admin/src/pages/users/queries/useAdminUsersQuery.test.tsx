import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAdminUsers } from '@/pages/users/api/getAdminUsers'
import { useAdminUsersQuery } from '@/pages/users/queries/useAdminUsersQuery'

vi.mock('@/pages/users/api/getAdminUsers', () => ({
  getAdminUsers: vi.fn(),
}))

const getAdminUsersMock = vi.mocked(getAdminUsers)

describe('useAdminUsersQuery', () => {
  beforeEach(() => {
    getAdminUsersMock.mockReset()
    getAdminUsersMock.mockResolvedValue({
      page: 0,
      size: 20,
      totalCount: 0,
      totalPages: 0,
      users: [],
    })
  })

  it('fetches the list with the supplied parameters', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const params = {
      sort: 'NICKNAME' as const,
      keyword: '더미',
      page: 0,
      size: 20,
    }
    const { result } = renderHook(() => useAdminUsersQuery(params), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(getAdminUsersMock).toHaveBeenCalledWith(params)
  })
})
