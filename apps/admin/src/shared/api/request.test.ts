import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/shared/api/apiClient'
import { request } from '@/shared/api/request'
import {
  clearAdminSession,
  getAdminSession,
  setAdminSession,
} from '@/shared/auth/adminSession'
import { reissueAdminSession } from '@/shared/auth/reissueAdminSession'

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: vi.fn(),
}))

vi.mock('@/shared/auth/reissueAdminSession', () => ({
  reissueAdminSession: vi.fn(),
}))

const apiClientMock = vi.mocked(apiClient)
const reissueAdminSessionMock = vi.mocked(reissueAdminSession)

const createResponse = ({
  status,
  success,
  data = null,
}: {
  status: number
  success: boolean
  data?: unknown
}) =>
  new Response(
    JSON.stringify({
      success,
      code: success ? 'COMMON-200' : `COMMON-${status}`,
      message: success ? '요청에 성공했습니다' : '인증이 필요합니다',
      data,
      timestamp: '2026-07-17T16:30:00.123',
      path: '/api/v1/admin/users',
    }),
    { status },
  )

describe('admin request auth recovery', () => {
  beforeEach(() => {
    window.localStorage.clear()
    apiClientMock.mockReset()
    reissueAdminSessionMock.mockReset()
    reissueAdminSessionMock.mockResolvedValue()
    setAdminSession({
      accessToken: 'expired-token',
      issuedAt: '2026-07-17T00:00:00Z',
      loginId: 'hashi-admin',
    })
  })

  it('reissues and replays one unauthorized request', async () => {
    apiClientMock
      .mockResolvedValueOnce(createResponse({ status: 401, success: false }))
      .mockResolvedValueOnce(
        createResponse({
          status: 200,
          success: true,
          data: { users: [] },
        }),
      )

    await expect(request('/api/v1/admin/users')).resolves.toEqual({ users: [] })

    expect(reissueAdminSessionMock).toHaveBeenCalledOnce()
    expect(apiClientMock).toHaveBeenCalledTimes(2)
  })

  it('clears the session when token reissue fails', async () => {
    apiClientMock.mockResolvedValueOnce(
      createResponse({ status: 401, success: false }),
    )
    reissueAdminSessionMock.mockRejectedValue(new Error('refresh failed'))

    await expect(request('/api/v1/admin/users')).rejects.toThrow(
      'refresh failed',
    )

    expect(getAdminSession()).toBeNull()
  })

  it('clears the session when the replay is still unauthorized', async () => {
    apiClientMock
      .mockResolvedValueOnce(createResponse({ status: 401, success: false }))
      .mockResolvedValueOnce(createResponse({ status: 401, success: false }))

    await expect(request('/api/v1/admin/users')).rejects.toMatchObject({
      status: 401,
    })

    expect(reissueAdminSessionMock).toHaveBeenCalledOnce()
    expect(getAdminSession()).toBeNull()
  })

  it('does not reissue forbidden requests', async () => {
    apiClientMock.mockResolvedValueOnce(
      createResponse({ status: 403, success: false }),
    )

    await expect(request('/api/v1/admin/users')).rejects.toMatchObject({
      status: 403,
    })

    expect(reissueAdminSessionMock).not.toHaveBeenCalled()
    expect(getAdminSession()).not.toBeNull()
  })

  it('does not recursively reissue an auth endpoint', async () => {
    apiClientMock.mockResolvedValueOnce(
      createResponse({ status: 401, success: false }),
    )

    await expect(request('/api/v1/auth/reissue')).rejects.toMatchObject({
      status: 401,
    })

    expect(reissueAdminSessionMock).not.toHaveBeenCalled()
  })

  afterEach(() => {
    clearAdminSession()
  })
})
