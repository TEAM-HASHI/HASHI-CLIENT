import { describe, expect, it } from 'vitest'

import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import type { ErrorResponse } from '@/shared/api/types'

const response: ErrorResponse = {
  success: false,
  code: 'USER-001',
  message: 'server message',
  data: null,
  timestamp: '2026-07-11T00:00:00.000Z',
  path: '/api/v1/users',
  errors: [
    {
      field: 'nickname',
      rejectedValue: '하시',
      reason: 'duplicate',
    },
  ],
}

describe('ApiError', () => {
  it('preserves actual status, response fields, and cause', () => {
    const cause = new SyntaxError('invalid response')
    const error = new ApiError(response, 409, { cause })

    expect(error).toMatchObject({
      name: 'ApiError',
      message: 'server message',
      status: 409,
      response,
      cause,
      code: 'USER-001',
      fieldErrors: response.errors,
    })
  })

  it('uses HttpStatusError for failures without a server envelope', () => {
    const cause = new SyntaxError('invalid response')
    const error = new HttpStatusError(502, { cause })

    expect(error.message).toBe('HTTP 502')
    expect(error.status).toBe(502)
    expect(error.cause).toBe(cause)
  })
})
