import { describe, expect, it } from 'vitest'

import {
  checkIsValidBirthDate,
  checkIsValidEmail,
  checkIsValidPhoneNumber,
  createOnboardingRequestBody,
  formatBirthDateInput,
  formatBirthDateForOnboarding,
  formatPhoneNumberInput,
  normalizeDigits,
} from '@/pages/profileNew/utils/profileNewForm'

describe('profileNewForm utils', () => {
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
    expect(checkIsValidPhoneNumber('12345')).toBe(false)
  })

  it('validates email format', () => {
    expect(checkIsValidEmail('hashi@example.com')).toBe(true)
    expect(checkIsValidEmail('hashi')).toBe(false)
  })

  it('formats birth date for onboarding API body', () => {
    expect(formatBirthDateForOnboarding('19980512')).toBe('1998-05-12')
    expect(formatBirthDateForOnboarding('1998/05/12')).toBe('1998-05-12')
  })

  it('creates onboarding request body without empty optional values', () => {
    expect(
      createOnboardingRequestBody({
        nickname: '하시',
        birthDate: '1998/05/12',
        phoneNumber: '010-1234-5678',
        englishName: '',
        email: 'hashi@example.com',
      }),
    ).toEqual({
      nickname: '하시',
      birthDate: '1998-05-12',
      phone: '01012345678',
      email: 'hashi@example.com',
    })
  })

  it('adds nameEng and profileImageKey to onboarding request body when present', () => {
    expect(
      createOnboardingRequestBody(
        {
          nickname: '하시',
          birthDate: '1998/05/12',
          phoneNumber: '010-1234-5678',
          englishName: 'Hashi',
          email: 'hashi@example.com',
        },
        'users/15/profile/profile.webp',
      ),
    ).toEqual({
      nickname: '하시',
      birthDate: '1998-05-12',
      phone: '01012345678',
      email: 'hashi@example.com',
      nameEng: 'Hashi',
      profileImageKey: 'users/15/profile/profile.webp',
    })
  })
})
