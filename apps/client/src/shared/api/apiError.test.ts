import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api/apiError'
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
    const error = new ApiError({ status: 409, response, cause })

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

  it('supports status-only HTTP failures without inventing a server envelope', () => {
    const error = new ApiError({ status: 502 })

    expect(error.message).toBe('HTTP 502')
    expect(error.code).toBeUndefined()
    expect(error.response).toBeUndefined()
    expect(error.fieldErrors).toEqual([])
  })
})
