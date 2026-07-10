import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/shared/api/apiError'
import type { ErrorResponse } from '@/shared/api/types'
import { createQueryClient } from '@/shared/lib/queryClient'

const { mockCaptureException, mockShowToast } = vi.hoisted(() => ({
  mockCaptureException: vi.fn(),
  mockShowToast: vi.fn(),
}))

vi.mock('@hashi/hds-ui', () => ({
  showToast: mockShowToast,
}))

vi.mock('@sentry/react', () => ({
  captureException: mockCaptureException,
}))

const response: ErrorResponse = {
  success: false,
  code: 'RESERVATION-004',
  message: 'raw server message',
  data: null,
  timestamp: '2026-07-11T00:00:00.000Z',
  path: '/api/v1/reservations/1/cancel',
}

const callDefaultMutationOnError = (error: Error) => {
  const onError = createQueryClient().getDefaultOptions().mutations?.onError as
    | ((nextError: Error) => void)
    | undefined

  expect(onError).toBeTypeOf('function')
  onError?.(error)
}

describe('queryClient mutation errors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows catalog copy without throwing an expected API error', () => {
    callDefaultMutationOnError(new ApiError({ status: 409, response }))

    expect(mockShowToast).toHaveBeenCalledWith({
      children: '이미 취소된 예약입니다',
    })
    expect(mockCaptureException).not.toHaveBeenCalled()
  })

  it('shows generic copy and captures an unexpected mutation error', () => {
    const error = new Error('unexpected mutation bug')

    callDefaultMutationOnError(error)

    expect(mockShowToast).toHaveBeenCalledWith({
      children: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    })
    expect(mockCaptureException).toHaveBeenCalledWith(error)
  })
})
