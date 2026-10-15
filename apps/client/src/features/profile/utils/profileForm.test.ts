import { describe, expect, it } from 'vitest'

import {
  checkIsValidBirthDate,
  checkIsValidPhoneNumber,
} from '@/features/profile/utils/profileForm'

describe('profileForm utils', () => {
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
