import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/shared/api/apiClient'
import { authApi } from '@/shared/api/authApi'

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

const postMock = vi.mocked(apiClient.post)

const createResponse = ({
  authorization,
  status = 200,
  success = true,
}: {
  authorization?: string
  status?: number
  success?: boolean
}) =>
  new Response(
    JSON.stringify({
      success,
      code: success ? 'SUCCESS' : 'AUTH-001',
      message: success ? '로그인 성공' : '로그인 실패',
      data: null,
      timestamp: '2026-07-12T00:00:00Z',
      path: '/api/v1/auth/admin/login',
    }),
    {
      status,
      headers: authorization ? { Authorization: authorization } : undefined,
    },
  )

describe('authApi', () => {
  beforeEach(() => {
    postMock.mockReset()
  })

  it('returns an admin session from the Authorization response header', async () => {
    postMock.mockResolvedValue(
      createResponse({ authorization: 'Bearer admin-access-token' }),
    )

    const session = await authApi.login({
      loginId: 'hashi-admin',
      password: 'password',
    })

    expect(postMock).toHaveBeenCalledWith('api/v1/auth/admin/login', {
      credentials: 'include',
      json: { loginId: 'hashi-admin', password: 'password' },
    })
    expect(session).toMatchObject({
      accessToken: 'admin-access-token',
      loginId: 'hashi-admin',
    })
    expect(session.issuedAt).toEqual(expect.any(String))
  })

  it('rejects a successful login response without an Authorization header', async () => {
    postMock.mockResolvedValue(createResponse({}))

    await expect(
      authApi.login({ loginId: 'hashi-admin', password: 'password' }),
    ).rejects.toThrow('로그인 응답에 access token이 없습니다.')
  })

  it('preserves the backend message for a rejected login', async () => {
    postMock.mockResolvedValue(createResponse({ status: 401, success: false }))

    await expect(
      authApi.login({ loginId: 'hashi-admin', password: 'wrong' }),
    ).rejects.toThrow('로그인 실패')
  })

  it('calls the logout endpoint with credential cookies', async () => {
    postMock.mockResolvedValue(createResponse({}))

    await authApi.logout()

    expect(postMock).toHaveBeenCalledWith('api/v1/auth/admin/logout', {
      credentials: 'include',
    })
  })

  it('returns the reissued access token', async () => {
    postMock.mockResolvedValue(
      createResponse({ authorization: 'Bearer renewed-admin-token' }),
    )

    await expect(authApi.reissue()).resolves.toBe('renewed-admin-token')
    expect(postMock).toHaveBeenCalledWith('api/v1/auth/reissue', {
      credentials: 'include',
    })
  })
})
