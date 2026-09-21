import { describe, expect, it } from 'vitest'

import {
  checkIsValidBirthDate,
  checkIsValidEmail,
  checkIsValidPhoneNumber,
  formatBirthDateInput,
  formatPhoneNumberInput,
  normalizeDigits,
} from '@/features/profile/utils/profileForm'

describe('profileForm utils', () => {
  it('formats birth date input as YYYY/MM/DD from digits only', () => {
    expect(formatBirthDateInput('20260708')).toBe('2026/07/08')
    expect(formatBirthDateInput('2026.07.08')).toBe('2026/07/08')
    expect(formatBirthDateInput('202607')).toBe('2026/07')
  })

  it('validates real birth dates in YYYYMMDD format', () => {
    expect(checkIsValidBirthDate('20260708')).toBe(true)
    expect(checkIsValidBirthDate('20260230')).toBe(false)
    expect(checkIsValidBirthDate('202607')).toBe(false)
    expect(checkIsValidBirthDate('29990101')).toBe(false)
  })

  it('formats and validates phone number input from digits only', () => {
    expect(normalizeDigits('010-1234-5678')).toBe('01012345678')
    expect(formatPhoneNumberInput('01012345678')).toBe('010-1234-5678')
    expect(formatPhoneNumberInput('0212345678')).toBe('02-1234-5678')
    expect(checkIsValidPhoneNumber('01012345678')).toBe(true)
    expect(checkIsValidPhoneNumber('02-123-4567')).toBe(false)
    expect(checkIsValidPhoneNumber('1234567890')).toBe(false)
    expect(checkIsValidPhoneNumber('12345')).toBe(false)
  })

  it('validates email format', () => {
    expect(checkIsValidEmail('hashi@example.com')).toBe(true)
    expect(checkIsValidEmail('hashi')).toBe(false)
  })
})
