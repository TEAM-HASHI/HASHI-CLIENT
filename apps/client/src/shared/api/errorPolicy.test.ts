import { NetworkError, TimeoutError } from 'ky'
import { describe, expect, it } from 'vitest'

import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import {
  checkIsExpectedRequestError,
  checkShouldRetryQuery,
  checkShouldThrowQueryError,
} from '@/shared/api/errorPolicy'
import type { ErrorResponse } from '@/shared/api/types'

const createApiError = (status: number) => {
  const response: ErrorResponse = {
    success: false,
    code: `COMMON-${status}`,
    message: '요청을 처리하지 못했습니다.',
    data: null,
    timestamp: '2026-07-11T00:00:00.000Z',
    path: '/api/v1/test',
  }

  return new ApiError(response, status)
}

describe('query error policy', () => {
  it('retries 5xx, network, and timeout once', () => {
    const request = new Request('https://api.hashi.test')
    const retryableErrors = [
      createApiError(500),
      new HttpStatusError(502),
      new NetworkError(request),
      new TimeoutError(request),
    ]

    retryableErrors.forEach((error) => {
      expect(checkShouldRetryQuery(0, error)).toBe(true)
      expect(checkShouldRetryQuery(1, error)).toBe(false)
    })
  })

  it('does not retry expected 4xx or unexpected client errors', () => {
    expect(checkShouldRetryQuery(0, createApiError(409))).toBe(false)
    expect(checkShouldRetryQuery(0, new HttpStatusError(404))).toBe(false)
    expect(checkShouldRetryQuery(0, new Error('render bug'))).toBe(false)
  })

  it('throws fatal query errors to a boundary but keeps 4xx local', () => {
    expect(checkShouldThrowQueryError(createApiError(400))).toBe(false)
    expect(checkShouldThrowQueryError(new HttpStatusError(404))).toBe(false)
    expect(checkShouldThrowQueryError(createApiError(500))).toBe(true)
    expect(checkShouldThrowQueryError(new HttpStatusError(502))).toBe(true)
    expect(checkShouldThrowQueryError(new Error('render bug'))).toBe(true)
  })

  it('classifies API and transport failures as expected request errors', () => {
    const request = new Request('https://api.hashi.test')

    expect(checkIsExpectedRequestError(createApiError(400))).toBe(true)
    expect(checkIsExpectedRequestError(new HttpStatusError(502))).toBe(true)
    expect(checkIsExpectedRequestError(new NetworkError(request))).toBe(true)
    expect(checkIsExpectedRequestError(new TimeoutError(request))).toBe(true)
    expect(checkIsExpectedRequestError(new Error('render bug'))).toBe(false)
  })
})
