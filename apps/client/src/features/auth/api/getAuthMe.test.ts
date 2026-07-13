import { beforeEach, describe, expect, it, vi } from 'vitest'

import { request } from '@/shared/api/request'

import { getAuthMe } from '@/features/auth/api/getAuthMe'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockedRequest = vi.mocked(request)

describe('getAuthMe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requests current auth subject with bearer token and cookies included', async () => {
    mockedRequest.mockResolvedValue({
      subjectId: 1,
      role: 'USER',
    })

    await expect(getAuthMe('access-token')).resolves.toEqual({
      subjectId: 1,
      role: 'USER',
    })
    expect(mockedRequest).toHaveBeenCalledWith('api/v1/auth/me', {
      headers: {
        Authorization: 'Bearer access-token',
      },
      credentials: 'include',
    })
  })
})
