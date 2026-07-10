import { NetworkError, TimeoutError } from 'ky'
import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api/apiError'
import {
  DEFAULT_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  TIMEOUT_ERROR_MESSAGE,
  getErrorPresentation,
} from '@/shared/api/errorPresentation'
import type { ErrorResponse } from '@/shared/api/types'

const createResponse = (code: string): ErrorResponse => ({
  success: false,
  code,
  message: 'raw server message',
  data: null,
  timestamp: '2026-07-11T00:00:00.000Z',
  path: '/api/v1/test',
})

describe('getErrorPresentation', () => {
  it('prefers known external code copy over raw server copy', () => {
    const error = new ApiError({
      status: 409,
      response: createResponse('USER-001'),
    })

    expect(getErrorPresentation(error)).toEqual({
      code: 'USER-001',
      message: '중복된 닉네임입니다',
    })
  })

  it('falls back to the common HTTP status for an unknown envelope code', () => {
    const error = new ApiError({
      status: 404,
      response: createResponse('FUTURE-404'),
    })

    expect(getErrorPresentation(error)).toEqual({
      code: 'COMMON-404',
      message: '리소스를 찾을 수 없습니다',
    })
  })

  it('maps timeout and network errors without exposing raw messages', () => {
    const request = new Request('https://api.hashi.test')

    expect(getErrorPresentation(new TimeoutError(request))).toEqual({
      message: TIMEOUT_ERROR_MESSAGE,
    })
    expect(getErrorPresentation(new NetworkError(request))).toEqual({
      message: NETWORK_ERROR_MESSAGE,
    })
  })

  it('uses generic copy for unknown errors and unmapped statuses', () => {
    expect(getErrorPresentation(new Error('secret detail'))).toEqual({
      message: DEFAULT_ERROR_MESSAGE,
    })
    expect(getErrorPresentation(new ApiError({ status: 502 }))).toEqual({
      message: DEFAULT_ERROR_MESSAGE,
    })
  })
})
