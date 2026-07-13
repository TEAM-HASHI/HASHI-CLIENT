import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import { apiClient } from '@/shared/api/apiClient'
import { request, requestSuccessResponse } from '@/shared/api/request'
import type { ErrorResponse } from '@/shared/api/types'
import { requestTokenReissue } from '@/features/auth/api/reissueToken'
import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
} from '@/features/auth/session/authSession'

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: vi.fn(),
}))

vi.mock('@/features/auth/api/reissueToken', () => ({
  requestTokenReissue: vi.fn(),
}))

const mockedApiClient = vi.mocked(apiClient)
const mockedRequestTokenReissue = vi.mocked(requestTokenReissue)

const createHttpResponse = ({
  ok,
  status,
  body,
  jsonError,
}: {
  ok: boolean
  status: number
  body?: unknown
  jsonError?: unknown
}) => ({
  ok,
  status,
  json: () =>
    jsonError === undefined ? Promise.resolve(body) : Promise.reject(jsonError),
})

const validationErrorResponse: ErrorResponse = {
  success: false,
  code: 'VALIDATION_ERROR',
  message: '입력값이 올바르지 않습니다.',
  data: null,
  timestamp: '2026-06-27T12:34:56.789Z',
  path: '/api/v1/users',
  errors: [
    {
      field: 'email',
      rejectedValue: 'abc',
      reason: '올바른 이메일 형식이 아닙니다.',
    },
  ],
}

describe('request', () => {
  beforeEach(() => {
    mockedApiClient.mockReset()
    mockedRequestTokenReissue.mockReset()
    vi.stubEnv('VITE_DEV_USER_ACCESS_TOKEN', '')
    clearAuthSession()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns data when success response includes data', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: true,
        status: 200,
        body: {
          success: true,
          code: 'SUCCESS',
          message: 'ok',
          data: { id: 1 },
        },
      }) as never,
    )

    await expect(request<{ id: number }>('users')).resolves.toEqual({ id: 1 })
    expect(mockedApiClient).toHaveBeenCalledWith('users', undefined)
  })

  it('returns the success response envelope when requested', async () => {
    const successResponse = {
      success: true,
      code: 'SUCCESS',
      message: '요청에 성공했습니다.',
      data: { id: 1 },
    }

    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: true,
        status: 200,
        body: successResponse,
      }) as never,
    )

    await expect(
      requestSuccessResponse<{ id: number }>('users'),
    ).resolves.toEqual(successResponse)
  })

  it('returns null when success response has null data', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: true,
        status: 200,
        body: {
          success: true,
          code: 'SUCCESS',
          message: 'ok',
          data: null,
        },
      }) as never,
    )

    await expect(request('users')).resolves.toBeNull()
  })

  it('throws ApiError when success is false', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: false,
        status: 400,
        body: validationErrorResponse,
      }) as never,
    )

    await expect(request('users')).rejects.toBeInstanceOf(ApiError)
  })

  it('preserves validation errors in ApiError', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: false,
        status: 400,
        body: validationErrorResponse,
      }) as never,
    )

    await expect(request('users')).rejects.toMatchObject({
      message: '입력값이 올바르지 않습니다.',
      status: 400,
      code: 'VALIDATION_ERROR',
      fieldErrors: validationErrorResponse.errors,
      response: validationErrorResponse,
    })
  })

  it('parses error body on HTTP 500', async () => {
    const serverError: ErrorResponse = {
      success: false,
      code: 'COMMON-500',
      message: '서버 오류',
      data: null,
      timestamp: '2026-06-27T12:34:56.789Z',
      path: '/api/v1/users',
    }

    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: false,
        status: 500,
        body: serverError,
      }) as never,
    )

    await expect(request('users')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      code: 'COMMON-500',
      response: serverError,
    })
  })

  it('normalizes a non-JSON HTTP failure with its actual status', async () => {
    const parseError = new SyntaxError('Unexpected token <')
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: false,
        status: 502,
        jsonError: parseError,
      }) as never,
    )

    const requestPromise = request('users')

    await expect(requestPromise).rejects.toMatchObject({
      name: 'HttpStatusError',
      message: 'HTTP 502',
      status: 502,
      cause: parseError,
    })
    await expect(requestPromise).rejects.toBeInstanceOf(HttpStatusError)
  })

  it('normalizes a malformed parsed HTTP failure without trusting its body', async () => {
    const malformedBody = { error: 'proxy detail' }
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: false,
        status: 500,
        body: malformedBody,
      }) as never,
    )

    const requestPromise = request('users')

    await expect(requestPromise).rejects.toMatchObject({
      name: 'HttpStatusError',
      message: 'HTTP 500',
      status: 500,
      cause: malformedBody,
    })
    await expect(requestPromise).rejects.toBeInstanceOf(HttpStatusError)
  })

  it('rejects a malformed success response as a contract error', async () => {
    const malformedBody = { success: true, message: 'missing data and code' }
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: true,
        status: 200,
        body: malformedBody,
      }) as never,
    )

    await expect(request('users')).rejects.toMatchObject({
      name: 'Error',
      message: 'Invalid API response',
      cause: malformedBody,
    })
  })

  it('normalizes leading slashes in request path', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: true,
        status: 200,
        body: {
          success: true,
          code: 'SUCCESS',
          message: 'ok',
          data: null,
        },
      }) as never,
    )

    await request('/users')

    expect(mockedApiClient).toHaveBeenCalledWith('users', undefined)
  })

  it('injects stored access token as bearer Authorization header', async () => {
    setAccessToken('stored-access-token')
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: true,
        status: 200,
        body: {
          success: true,
          code: 'SUCCESS',
          message: 'ok',
          data: null,
        },
      }) as never,
    )

    await request('users/me', {
      credentials: 'include',
    })

    expect(mockedApiClient).toHaveBeenCalledWith(
      'users/me',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.any(Headers),
      }),
    )
    const [, options] = mockedApiClient.mock.calls[0]
    expect((options?.headers as Headers).get('Authorization')).toBe(
      'Bearer stored-access-token',
    )
  })

  it('injects the development access token when memory session is empty', async () => {
    vi.stubEnv('VITE_DEV_USER_ACCESS_TOKEN', 'development-token')
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: true,
        status: 200,
        body: {
          success: true,
          code: 'SUCCESS',
          message: 'ok',
          data: null,
        },
      }) as never,
    )

    await request('users/me')

    const [, options] = mockedApiClient.mock.calls[0]
    expect((options?.headers as Headers).get('Authorization')).toBe(
      'Bearer development-token',
    )
  })

  it('does not overwrite explicit Authorization header', async () => {
    setAccessToken('stored-access-token')
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: true,
        status: 200,
        body: {
          success: true,
          code: 'SUCCESS',
          message: 'ok',
          data: null,
        },
      }) as never,
    )

    await request('admin/me', {
      headers: {
        Authorization: 'Bearer explicit-token',
      },
    })

    expect(mockedApiClient).toHaveBeenCalledWith(
      'admin/me',
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    )
    const [, options] = mockedApiClient.mock.calls[0]
    expect((options?.headers as Headers).get('Authorization')).toBe(
      'Bearer explicit-token',
    )
  })

  it('reissues token on auth 401 and retries the original request once', async () => {
    mockedApiClient
      .mockResolvedValueOnce(
        createHttpResponse({
          ok: false,
          status: 401,
          body: {
            success: false,
            code: 'AUTH-002',
            message: '만료된 토큰입니다',
            data: null,
            timestamp: '2026-07-12T19:36:51.713886635',
            path: '/api/v1/restaurants/me',
          },
        }) as never,
      )
      .mockResolvedValueOnce(
        createHttpResponse({
          ok: true,
          status: 200,
          body: {
            success: true,
            code: 'SUCCESS',
            message: 'ok',
            data: { id: 1 },
          },
        }) as never,
      )
    mockedRequestTokenReissue.mockResolvedValue({
      accessToken: 'fresh-access-token',
    })

    await expect(request<{ id: number }>('restaurants/me')).resolves.toEqual({
      id: 1,
    })

    expect(mockedRequestTokenReissue).toHaveBeenCalledTimes(1)
    expect(getAccessToken()).toBe('fresh-access-token')
    expect(mockedApiClient).toHaveBeenCalledTimes(2)

    const [, retryOptions] = mockedApiClient.mock.calls[1]
    expect((retryOptions?.headers as Headers).get('Authorization')).toBe(
      'Bearer fresh-access-token',
    )
  })

  it('reissues token when a 401 response has no JSON body', async () => {
    mockedApiClient
      .mockResolvedValueOnce(
        createHttpResponse({
          ok: false,
          status: 401,
          jsonError: new SyntaxError('empty response'),
        }) as never,
      )
      .mockResolvedValueOnce(
        createHttpResponse({
          ok: true,
          status: 200,
          body: {
            success: true,
            code: 'SUCCESS',
            message: 'ok',
            data: { id: 1 },
          },
        }) as never,
      )
    mockedRequestTokenReissue.mockResolvedValue({
      accessToken: 'fresh-access-token',
    })

    await expect(request<{ id: number }>('restaurants/me')).resolves.toEqual({
      id: 1,
    })
    expect(mockedRequestTokenReissue).toHaveBeenCalledTimes(1)
  })

  it('clears session and throws original auth error when token reissue fails', async () => {
    setAccessToken('expired-access-token')
    mockedApiClient.mockResolvedValueOnce(
      createHttpResponse({
        ok: false,
        status: 401,
        body: {
          success: false,
          code: 'AUTH-002',
          message: '만료된 토큰입니다',
          data: null,
          timestamp: '2026-07-12T19:36:51.713886635',
          path: '/api/v1/restaurants/me',
        },
      }) as never,
    )
    mockedRequestTokenReissue.mockRejectedValue(
      new Error('Refresh token expired.'),
    )

    await expect(request('restaurants/me')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'AUTH-002',
    })

    expect(mockedRequestTokenReissue).toHaveBeenCalledTimes(1)
    expect(getAccessToken()).toBeUndefined()
  })

  it('does not reissue for auth endpoints to avoid retry loops', async () => {
    mockedApiClient.mockResolvedValueOnce(
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

    await expect(request('api/v1/auth/reissue')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'AUTH-003',
    })

    expect(mockedRequestTokenReissue).not.toHaveBeenCalled()
  })

  it('shares one token reissue request across concurrent auth 401 responses', async () => {
    const authErrorResponse = createHttpResponse({
      ok: false,
      status: 401,
      body: {
        success: false,
        code: 'AUTH-002',
        message: '만료된 토큰입니다',
        data: null,
        timestamp: '2026-07-12T19:36:51.713886635',
        path: '/api/v1/restaurants/me',
      },
    }) as never
    mockedApiClient
      .mockResolvedValueOnce(authErrorResponse)
      .mockResolvedValueOnce(authErrorResponse)
      .mockResolvedValueOnce(
        createHttpResponse({
          ok: true,
          status: 200,
          body: {
            success: true,
            code: 'SUCCESS',
            message: 'ok',
            data: { id: 1 },
          },
        }) as never,
      )
      .mockResolvedValueOnce(
        createHttpResponse({
          ok: true,
          status: 200,
          body: {
            success: true,
            code: 'SUCCESS',
            message: 'ok',
            data: { id: 2 },
          },
        }) as never,
      )
    mockedRequestTokenReissue.mockResolvedValue({
      accessToken: 'shared-access-token',
    })

    await expect(
      Promise.all([
        request<{ id: number }>('restaurants/1'),
        request<{ id: number }>('restaurants/2'),
      ]),
    ).resolves.toEqual([{ id: 1 }, { id: 2 }])

    expect(mockedRequestTokenReissue).toHaveBeenCalledTimes(1)
    expect(mockedApiClient).toHaveBeenCalledTimes(4)
  })
})
