import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import { apiClient } from '@/shared/api/apiClient'
import { request, requestSuccessResponse } from '@/shared/api/request'
import type { ErrorResponse } from '@/shared/api/types'
import { requestTokenReissue } from '@/shared/api/requestTokenReissue'
import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: vi.fn(),
}))

vi.mock('@/shared/api/requestTokenReissue', () => ({
  requestTokenReissue: vi.fn(),
}))

const mockedApiClient = vi.mocked(apiClient)
const mockedRequestTokenReissue = vi.mocked(requestTokenReissue)

const createDeferred = <T>() => {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

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

  it('does not restore a session when token reissue completes after logout', async () => {
    setAccessToken('expired-access-token')
    let resolveReissue!: (value: { accessToken: string }) => void
    mockedRequestTokenReissue.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveReissue = resolve
        }),
    )
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: false,
        status: 401,
        body: {
          success: false,
          code: 'COMMON-401',
          message: '인증 필요',
          data: null,
          timestamp: '2026-10-05',
          path: '/api/v1/users/me',
        },
      }) as never,
    )
    const pending = request('api/v1/users/me')
    const rejection = expect(pending).rejects.toMatchObject({ status: 401 })
    await vi.waitFor(() =>
      expect(mockedRequestTokenReissue).toHaveBeenCalledOnce(),
    )
    clearAuthSession()
    resolveReissue({ accessToken: 'late-access-token' })
    await rejection
    expect(getAccessToken()).toBeUndefined()
    expect(mockedApiClient).toHaveBeenCalledOnce()
  })

  it('isolates pending token reissues when a new login completes without logout', async () => {
    const resolvers: ((value: { accessToken: string }) => void)[] = []
    mockedRequestTokenReissue.mockImplementation(
      () => new Promise((resolve) => resolvers.push(resolve)),
    )
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: false,
        status: 401,
        body: {
          success: false,
          code: 'COMMON-401',
          message: '인증 필요',
          data: null,
          timestamp: '2026-10-12',
          path: '/api/v1/users/me',
        },
      }) as never,
    )
    setAccessToken('old-session')
    const oldRequest = request('api/v1/users/me')
    const oldRejection = expect(oldRequest).rejects.toMatchObject({
      status: 401,
    })
    await vi.waitFor(() => expect(resolvers).toHaveLength(1))

    startAuthenticatedSession('new-session')
    const newRequest = request('api/v1/users/me')
    const newResult = expect(newRequest).resolves.toEqual({ id: 2 })
    await vi.waitFor(() => expect(resolvers).toHaveLength(2))
    resolvers[0]({ accessToken: 'old-refreshed-token' })
    await oldRejection
    expect(getAccessToken()).toBe('new-session')

    const concurrentRequest = request('api/v1/users/me')
    const concurrentResult = expect(concurrentRequest).resolves.toEqual({
      id: 2,
    })
    await vi.waitFor(() => expect(mockedApiClient).toHaveBeenCalledTimes(3))
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(resolvers).toHaveLength(2)
    mockedApiClient.mockResolvedValue(
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
    resolvers[1]({ accessToken: 'new-refreshed-token' })
    await newResult
    await concurrentResult
    expect(mockedRequestTokenReissue).toHaveBeenCalledTimes(2)
    expect(getAccessToken()).toBe('new-refreshed-token')
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
    mockedRequestTokenReissue.mockRejectedValue(new HttpStatusError(401))

    await expect(request('restaurants/me')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'AUTH-002',
    })

    expect(mockedRequestTokenReissue).toHaveBeenCalledTimes(1)
    expect(getAccessToken()).toBeUndefined()
  })

  it('preserves the session when reissue fails temporarily', async () => {
    setAccessToken('existing-token')
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: false,
        status: 401,
        body: {
          success: false,
          code: 'AUTH-002',
          message: '만료',
          data: null,
          timestamp: '2026-10-12',
          path: '/api/v1/users/me',
        },
      }) as never,
    )
    mockedRequestTokenReissue.mockRejectedValue(new HttpStatusError(503))
    await expect(request('api/v1/users/me')).rejects.toMatchObject({
      status: 503,
    })
    expect(getAccessToken()).toBe('existing-token')
  })

  it('does not inject a development token into cookie-based auth checks', async () => {
    vi.stubEnv('VITE_DEV_USER_ACCESS_TOKEN', 'development-token')
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: true,
        status: 200,
        body: { success: true, code: 'SUCCESS', message: 'ok', data: null },
      }) as never,
    )
    await request('api/v1/auth/me', { credentials: 'include' })
    expect(mockedApiClient).toHaveBeenCalledWith('api/v1/auth/me', {
      credentials: 'include',
    })
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

  it('does not start recovery for a 401 delivered after the originating session ended', async () => {
    setAccessToken('account-a')
    const response = createDeferred<Awaited<ReturnType<typeof apiClient>>>()
    mockedApiClient.mockReturnValueOnce(response.promise as never)
    mockedRequestTokenReissue.mockResolvedValue({ accessToken: 'stale-token' })
    const pending = request('users/me').catch((error: unknown) => error)

    clearAuthSession()
    setAccessToken('account-b')
    response.resolve(createHttpResponse({ ok: false, status: 401 }) as never)
    const error = await pending

    expect(mockedRequestTokenReissue).not.toHaveBeenCalled()
    expect(mockedApiClient).toHaveBeenCalledTimes(1)
    expect(getAccessToken()).toBe('account-b')
    expect(error).toMatchObject({ status: 401 })
  })

  it.each(['success', 'failure'])(
    'does not mutate a newer session or replay an old request after late refresh %s',
    async (outcome) => {
      setAccessToken('account-a')
      const refresh = createDeferred<{ accessToken: string }>()
      mockedRequestTokenReissue.mockReturnValueOnce(refresh.promise)
      mockedApiClient.mockResolvedValue(
        createHttpResponse({ ok: false, status: 401 }) as never,
      )
      const pending = request('users/me').catch((error: unknown) => error)
      await vi.waitFor(() =>
        expect(mockedRequestTokenReissue).toHaveBeenCalledTimes(1),
      )

      clearAuthSession()
      setAccessToken('account-b')
      if (outcome === 'success') refresh.resolve({ accessToken: 'stale-token' })
      else refresh.reject(new Error('old refresh failed'))
      const error = await pending

      expect(getAccessToken()).toBe('account-b')
      expect(mockedApiClient).toHaveBeenCalledTimes(1)
      expect(error).toMatchObject({ status: 401 })
    },
  )
})
