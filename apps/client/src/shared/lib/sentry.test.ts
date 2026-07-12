import { describe, expect, it } from 'vitest'

import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import type { ErrorResponse } from '@/shared/api/types'
import { checkShouldCaptureError } from '@/shared/lib/sentry'

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

describe('checkShouldCaptureError', () => {
  it('captures unknown runtime errors', () => {
    expect(checkShouldCaptureError(new Error('render failed'))).toBe(true)
  })

  it('captures ApiError with server error status', () => {
    expect(checkShouldCaptureError(createApiError(500))).toBe(true)
    expect(checkShouldCaptureError(createApiError(502))).toBe(true)
  })

  it('captures method mismatch ApiError as an integration error', () => {
    expect(checkShouldCaptureError(createApiError(405))).toBe(true)
  })

  it('does not capture expected client or business ApiError', () => {
    expect(checkShouldCaptureError(createApiError(400))).toBe(false)
    expect(checkShouldCaptureError(createApiError(401))).toBe(false)
    expect(checkShouldCaptureError(createApiError(404))).toBe(false)
    expect(checkShouldCaptureError(createApiError(409))).toBe(false)
    expect(checkShouldCaptureError(createApiError(415))).toBe(false)
  })

  it('captures HttpStatusError with reportable status only', () => {
    expect(checkShouldCaptureError(new HttpStatusError(502))).toBe(true)
    expect(checkShouldCaptureError(new HttpStatusError(405))).toBe(true)
    expect(checkShouldCaptureError(new HttpStatusError(400))).toBe(false)
    expect(checkShouldCaptureError(new HttpStatusError(404))).toBe(false)
    expect(checkShouldCaptureError(new HttpStatusError(409))).toBe(false)
  })
})
