import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import { apiClient } from '@/shared/api/apiClient'
import { request, requestSuccessResponse } from '@/shared/api/request'
import type { ErrorResponse } from '@/shared/api/types'

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: vi.fn(),
}))

const mockedApiClient = vi.mocked(apiClient)

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
    vi.clearAllMocks()
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
})
