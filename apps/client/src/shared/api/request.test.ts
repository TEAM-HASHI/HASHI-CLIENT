import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/api/apiError'
import { apiClient } from '@/shared/api/apiClient'
import { request } from '@/shared/api/request'
import type { ErrorResponse } from '@/shared/api/types'

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: vi.fn(),
}))

const mockedApiClient = vi.mocked(apiClient)

const createHttpResponse = ({
  ok,
  status,
  body,
}: {
  ok: boolean
  status: number
  body: unknown
}) => ({
  ok,
  status,
  json: () => Promise.resolve(body),
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
      code: 'VALIDATION_ERROR',
      fieldErrors: validationErrorResponse.errors,
      response: validationErrorResponse,
    })
  })

  it('parses error body on HTTP 500', async () => {
    const serverError: ErrorResponse = {
      success: false,
      code: 'INTERNAL_ERROR',
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

    await expect(request('users')).rejects.toEqual(new ApiError(serverError))
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
