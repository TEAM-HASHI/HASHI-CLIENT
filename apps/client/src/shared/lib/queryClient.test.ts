import { describe, expect, it } from 'vitest'

import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import type { ErrorResponse } from '@/shared/api/types'
import { queryClient } from '@/shared/lib/queryClient'

type QueryRetry = (failureCount: number, error: Error) => boolean

const createApiError = (status: number) => {
  const response: ErrorResponse = {
    success: false,
    code: `COMMON-${status}`,
    message: '요청을 처리하지 못했습니다.',
    data: null,
    timestamp: '2026-07-10T13:00:00.000Z',
    path: '/api/v1/test',
  }

  return new ApiError(response, status)
}

const getQueryRetry = () => {
  const retry = queryClient.getDefaultOptions().queries?.retry

  if (typeof retry !== 'function') {
    throw new Error('query retry option must be a function')
  }

  return retry as QueryRetry
}

describe('queryClient', () => {
  it('retries ApiError with server error status before the max retry count', () => {
    const retry = getQueryRetry()

    expect(retry(0, createApiError(500))).toBe(true)
    expect(retry(0, createApiError(502))).toBe(true)
  })

  it('does not retry ApiError with client or business error status', () => {
    const retry = getQueryRetry()

    expect(retry(0, createApiError(400))).toBe(false)
    expect(retry(0, createApiError(401))).toBe(false)
    expect(retry(0, createApiError(404))).toBe(false)
    expect(retry(0, createApiError(409))).toBe(false)
  })

  it('retries HttpStatusError with server error status only', () => {
    const retry = getQueryRetry()

    expect(retry(0, new HttpStatusError(502))).toBe(true)
    expect(retry(0, new HttpStatusError(503))).toBe(true)
    expect(retry(0, new HttpStatusError(404))).toBe(false)
    expect(retry(0, new HttpStatusError(409))).toBe(false)
  })

  it('does not retry after the max retry count', () => {
    const retry = getQueryRetry()

    expect(retry(1, createApiError(500))).toBe(false)
  })
})
