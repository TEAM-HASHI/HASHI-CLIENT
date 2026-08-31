import { describe, expect, it, vi } from 'vitest'

import { applyProfileNewOnboardingError } from '@/pages/profileNew/utils/profileNewOnboardingError'
import { ApiError } from '@/shared/api/apiError'
import type { ErrorResponse } from '@/shared/api/types'

const createErrorResponse = (
  code: string,
  status: number,
  message: string,
  errors?: ErrorResponse['errors'],
): ApiError =>
  new ApiError(
    {
      success: false,
      code,
      message,
      data: null,
      timestamp: '2026-07-14T00:00:00.000Z',
      path: '/api/v1/users/onboarding',
      ...(errors ? { errors } : {}),
    },
    status,
  )

describe('profileNewOnboardingError utils', () => {
  it('maps duplicated field errors to profile form fields', () => {
    const setFieldError = vi.fn()
    const setFormError = vi.fn()

    const handled = applyProfileNewOnboardingError(
      createErrorResponse('USER-001', 409, '중복된 닉네임입니다'),
      {
        setFieldError,
        setFormError,
      },
    )

    expect(handled).toBe(true)
    expect(setFieldError).toHaveBeenCalledWith(
      'nickname',
      '중복된 닉네임입니다',
    )
    expect(setFormError).not.toHaveBeenCalled()
  })

  it('maps COMMON-400 field errors to profile form fields', () => {
    const setFieldError = vi.fn()
    const setFormError = vi.fn()

    const handled = applyProfileNewOnboardingError(
      createErrorResponse('COMMON-400', 400, '잘못된 요청입니다', [
        {
          field: 'phone',
          rejectedValue: '010-1234-5678',
          reason: '연락처는 하이픈 없이 숫자 10~11자리로 입력해주세요',
        },
      ]),
      {
        setFieldError,
        setFormError,
      },
    )

    expect(handled).toBe(true)
    expect(setFieldError).toHaveBeenCalledWith(
      'phoneNumber',
      '연락처는 하이픈 없이 숫자 10~11자리로 입력해주세요',
    )
    expect(setFormError).not.toHaveBeenCalled()
  })

  it('uses form error when COMMON-400 has no mappable field error', () => {
    const setFieldError = vi.fn()
    const setFormError = vi.fn()

    const handled = applyProfileNewOnboardingError(
      createErrorResponse('COMMON-400', 400, '잘못된 요청입니다', [
        {
          field: 'unknown',
          rejectedValue: '',
          reason: '알 수 없는 오류입니다',
        },
      ]),
      {
        setFieldError,
        setFormError,
      },
    )

    expect(handled).toBe(true)
    expect(setFieldError).not.toHaveBeenCalled()
    expect(setFormError).toHaveBeenCalledWith('잘못된 요청입니다')
  })

  it('does not handle unexpected errors', () => {
    const setFieldError = vi.fn()
    const setFormError = vi.fn()

    const handled = applyProfileNewOnboardingError(new Error('network'), {
      setFieldError,
      setFormError,
    })

    expect(handled).toBe(false)
    expect(setFieldError).not.toHaveBeenCalled()
    expect(setFormError).not.toHaveBeenCalled()
  })
})
