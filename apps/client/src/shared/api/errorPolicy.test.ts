import { NetworkError, TimeoutError } from 'ky'
import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api/apiError'
import {
  checkIsExpectedRequestError,
  checkShouldRetryQuery,
  checkShouldThrowQueryError,
} from '@/shared/api/errorPolicy'

describe('query error policy', () => {
  it('retries 5xx, network, and timeout once', () => {
    const request = new Request('https://api.hashi.test')
    const retryableErrors = [
      new ApiError({ status: 500 }),
      new ApiError({ status: 502 }),
      new NetworkError(request),
      new TimeoutError(request),
    ]

    retryableErrors.forEach((error) => {
      expect(checkShouldRetryQuery(0, error)).toBe(true)
      expect(checkShouldRetryQuery(1, error)).toBe(false)
    })
  })

  it('does not retry expected 4xx or unexpected client errors', () => {
    expect(checkShouldRetryQuery(0, new ApiError({ status: 409 }))).toBe(false)
    expect(checkShouldRetryQuery(0, new Error('render bug'))).toBe(false)
  })

  it('throws fatal query errors to a boundary but keeps 4xx local', () => {
    expect(checkShouldThrowQueryError(new ApiError({ status: 400 }))).toBe(
      false,
    )
    expect(checkShouldThrowQueryError(new ApiError({ status: 500 }))).toBe(true)
    expect(checkShouldThrowQueryError(new Error('render bug'))).toBe(true)
  })

  it('classifies API and transport failures as expected request errors', () => {
    const request = new Request('https://api.hashi.test')

    expect(checkIsExpectedRequestError(new ApiError({ status: 400 }))).toBe(
      true,
    )
    expect(checkIsExpectedRequestError(new NetworkError(request))).toBe(true)
    expect(checkIsExpectedRequestError(new TimeoutError(request))).toBe(true)
    expect(checkIsExpectedRequestError(new Error('render bug'))).toBe(false)
  })
})
