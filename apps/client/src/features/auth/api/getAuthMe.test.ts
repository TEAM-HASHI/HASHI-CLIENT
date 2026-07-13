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

  it('requests cookie-based auth status without an Authorization header', async () => {
    mockedRequest.mockResolvedValue({
      role: 'ONBOARDING',
    })

    await expect(getAuthMe()).resolves.toEqual({
      role: 'ONBOARDING',
    })
    expect(mockedRequest).toHaveBeenCalledWith('api/v1/auth/me', {
      credentials: 'include',
    })
  })

  it('rejects a malformed successful auth response', async () => {
    mockedRequest.mockResolvedValue(null)

    await expect(getAuthMe('access-token')).rejects.toThrow(
      'Invalid API response',
    )
  })
})
