import { describe, expect, it } from 'vitest'

import {
  createOnboardingRequestBody,
  formatBirthDateForOnboarding,
} from '@/pages/profileNew/utils/profileNewForm'

describe('profileNewForm utils', () => {
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
