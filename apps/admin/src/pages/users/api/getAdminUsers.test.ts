import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAdminUsers } from '@/pages/users/api/getAdminUsers'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const requestMock = vi.mocked(request)

describe('getAdminUsers', () => {
  beforeEach(() => {
    requestMock.mockReset()
    requestMock.mockResolvedValue({
      page: 0,
      size: 20,
      totalCount: 0,
      totalPages: 0,
      users: [],
    })
  })

  it('requests the member list with every response-changing parameter', async () => {
    await getAdminUsers({
      sort: 'CREATED_AT',
      keyword: '더미',
      page: 2,
      size: 20,
    })

    expect(requestMock).toHaveBeenCalledWith('/api/v1/admin/users', {
      searchParams: {
        sort: 'CREATED_AT',
        keyword: '더미',
        page: 2,
        size: 20,
      },
    })
  })

  it('trims a nickname keyword', async () => {
    await getAdminUsers({
      sort: 'NICKNAME',
      keyword: '  더미  ',
      page: 0,
      size: 20,
    })

    expect(requestMock).toHaveBeenCalledWith('/api/v1/admin/users', {
      searchParams: {
        sort: 'NICKNAME',
        keyword: '더미',
        page: 0,
        size: 20,
      },
    })
  })

  it('omits a blank nickname keyword', async () => {
    await getAdminUsers({
      sort: 'NICKNAME',
      keyword: '   ',
      page: 0,
      size: 20,
    })

    expect(requestMock).toHaveBeenCalledWith('/api/v1/admin/users', {
      searchParams: {
        sort: 'NICKNAME',
        page: 0,
        size: 20,
      },
    })
  })
})
