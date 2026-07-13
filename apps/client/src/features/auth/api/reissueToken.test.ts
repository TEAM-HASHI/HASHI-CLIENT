import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiClient } from '@/shared/api/apiClient'

import { requestTokenReissue } from '@/features/auth/api/reissueToken'

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: vi.fn(),
}))

const mockedApiClient = vi.mocked(apiClient)

const createHttpResponse = ({
  ok = true,
  status = 200,
  body,
  authorization,
}: {
  ok?: boolean
  status?: number
  body: unknown
  authorization?: string
}) => ({
  ok,
  status,
  headers: new Headers(
    authorization ? { Authorization: authorization } : undefined,
  ),
  json: () => Promise.resolve(body),
})

describe('requestTokenReissue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('posts without body and extracts bearer access token from Authorization header', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        authorization: 'Bearer reissued-access-token',
        body: {
          success: true,
          code: 'AUTH-202',
          message: '토큰이 재발급되었습니다',
          data: null,
        },
      }) as never,
    )

    await expect(requestTokenReissue()).resolves.toEqual({
      accessToken: 'reissued-access-token',
    })
    expect(mockedApiClient).toHaveBeenCalledWith('api/v1/auth/reissue', {
      method: 'post',
      credentials: 'include',
    })
  })

  it('throws when successful reissue omits Authorization header', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        body: {
          success: true,
          code: 'AUTH-202',
          message: '토큰이 재발급되었습니다',
          data: null,
        },
      }) as never,
    )

    await expect(requestTokenReissue()).rejects.toThrow(
      'Authorization header is missing.',
    )
  })

  it('throws when successful reissue uses a non-Bearer Authorization header', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        authorization: 'Basic reissued-access-token',
        body: {
          success: true,
          code: 'AUTH-202',
          message: '토큰이 재발급되었습니다',
          data: null,
        },
      }) as never,
    )

    await expect(requestTokenReissue()).rejects.toThrow(
      'Authorization header is missing.',
    )
  })

  it('throws ApiError when reissue returns an error response', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: false,
        status: 401,
        body: {
          success: false,
          code: 'AUTH-003',
          message: '리프레시 토큰이 존재하지 않습니다',
          data: null,
          timestamp: '2026-07-12T19:36:51.713886635',
          path: '/api/v1/auth/reissue',
        },
      }) as never,
    )

    await expect(requestTokenReissue()).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      code: 'AUTH-003',
    })
  })
})
