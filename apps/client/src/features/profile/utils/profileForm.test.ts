import { describe, expect, it, vi } from 'vitest'

import {
  checkIsValidBirthDate,
  checkIsValidPhoneNumber,
} from '@/features/profile/utils/profileForm'

describe('profileForm utils', () => {
  it('rejects today rather than treating midnight as a past birth date', () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date(2026, 9, 17, 15))
      expect(checkIsValidBirthDate('20261017')).toBe(false)
      expect(checkIsValidBirthDate('20261016')).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })
  it('validates real birth dates in YYYYMMDD format', () => {
    expect(checkIsValidBirthDate('20260708')).toBe(true)
    expect(checkIsValidBirthDate('20260230')).toBe(false)
    expect(checkIsValidBirthDate('202607')).toBe(false)
    expect(checkIsValidBirthDate('29990101')).toBe(false)
  })

  it('accepts only the required phone prefix and digit count', () => {
    expect(checkIsValidPhoneNumber('01012345678')).toBe(true)
    expect(checkIsValidPhoneNumber('02-123-4567')).toBe(false)
    expect(checkIsValidPhoneNumber('1234567890')).toBe(false)
    expect(checkIsValidPhoneNumber('12345')).toBe(false)
  })
})
