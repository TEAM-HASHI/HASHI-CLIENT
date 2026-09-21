import type { components } from '@/shared/api/generated/openapi'
import { normalizeDigits } from '@/features/profile/utils/profileForm'

type OnboardingRequestBody = components['schemas']['CompleteOnboardingRequest']

interface OnboardingFormDraft {
  nickname: string
  birthDate: string
  phoneNumber: string
  englishName?: string
  email: string
}

export const formatBirthDateForOnboarding = (value: string) => {
  const digits = normalizeDigits(value).slice(0, 8)

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
}

export const createOnboardingRequestBody = (
  draft: OnboardingFormDraft,
  profileImageKey?: string,
): OnboardingRequestBody => {
  const nameEng = draft.englishName?.trim()

  return {
    nickname: draft.nickname,
    birthDate: formatBirthDateForOnboarding(draft.birthDate),
    phone: normalizeDigits(draft.phoneNumber),
    email: draft.email,
    ...(nameEng ? { nameEng } : {}),
    ...(profileImageKey ? { profileImageKey } : {}),
  }
}
