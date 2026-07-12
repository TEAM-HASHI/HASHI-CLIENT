import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import type { ErrorResponse } from '@/shared/api/types'
import { createQueryClient } from '@/shared/lib/queryClient'

const { mockCaptureError, mockShowToast } = vi.hoisted(() => ({
  mockCaptureError: vi.fn(),
  mockShowToast: vi.fn(),
}))

vi.mock('@hashi/hds-ui', () => ({
  showToast: mockShowToast,
}))

vi.mock('@/shared/lib/sentry', () => ({
  captureError: mockCaptureError,
}))

type QueryRetry = (failureCount: number, error: Error) => boolean

const mutationErrorResponse: ErrorResponse = {
  success: false,
  code: 'RESERVATION-004',
  message: 'raw server message',
  data: null,
  timestamp: '2026-07-11T00:00:00.000Z',
  path: '/api/v1/reservations/1/cancel',
}

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
  const retry = createQueryClient().getDefaultOptions().queries?.retry

  if (typeof retry !== 'function') {
    throw new Error('query retry option must be a function')
  }

  return retry as QueryRetry
}

const callDefaultMutationOnError = (error: Error) => {
  const onError = createQueryClient().getDefaultOptions().mutations?.onError as
    | ((nextError: Error) => void)
    | undefined

  expect(onError).toBeTypeOf('function')
  onError?.(error)
}

describe('queryClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retries status errors only for server failures before the limit', () => {
    const retry = getQueryRetry()

    expect(retry(0, createApiError(500))).toBe(true)
    expect(retry(0, new HttpStatusError(502))).toBe(true)
    expect(retry(0, createApiError(409))).toBe(false)
    expect(retry(0, new HttpStatusError(404))).toBe(false)
    expect(retry(1, createApiError(500))).toBe(false)
  })

  it('shows catalog copy without throwing an expected API error', () => {
    const error = new ApiError(mutationErrorResponse, 409)

    callDefaultMutationOnError(error)

    expect(mockShowToast).toHaveBeenCalledWith({
      children: '이미 취소된 예약입니다',
    })
    expect(mockCaptureError).toHaveBeenCalledWith(error)
  })

  it('shows a status fallback for an HTTP-only mutation failure', () => {
    const error = new HttpStatusError(404)

    callDefaultMutationOnError(error)

    expect(mockShowToast).toHaveBeenCalledWith({
      children: '리소스를 찾을 수 없습니다',
    })
    expect(mockCaptureError).toHaveBeenCalledWith(error)
  })

  it('delegates reportable mutation status errors to the Sentry filter', () => {
    const apiError = createApiError(500)
    const httpStatusError = new HttpStatusError(502)

    callDefaultMutationOnError(apiError)
    callDefaultMutationOnError(httpStatusError)

    expect(mockCaptureError).toHaveBeenNthCalledWith(1, apiError)
    expect(mockCaptureError).toHaveBeenNthCalledWith(2, httpStatusError)
  })

  it('shows generic copy and captures an unexpected mutation error', () => {
    const error = new Error('unexpected mutation bug')

    callDefaultMutationOnError(error)

    expect(mockShowToast).toHaveBeenCalledWith({
      children: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    })
    expect(mockCaptureError).toHaveBeenCalledWith(error)
  })
})
