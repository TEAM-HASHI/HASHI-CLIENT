import { isApiError } from '@/shared/api/apiError'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import type { FieldError } from '@/shared/api/types'

export type ProfileNewFieldName =
  | 'nickname'
  | 'birthDate'
  | 'phoneNumber'
  | 'englishName'
  | 'email'

export interface ProfileNewOnboardingErrorHandlers {
  setFieldError: (fieldName: ProfileNewFieldName, message: string) => void
  setFormError: (message: string) => void
}

const ONBOARDING_ERROR_FIELD_MAP = {
  nickname: 'nickname',
  birthDate: 'birthDate',
  phone: 'phoneNumber',
  nameEng: 'englishName',
  email: 'email',
} as const

const DUPLICATED_FIELD_ERROR_CODE_MAP = {
  'USER-001': 'nickname',
  'USER-002': 'email',
  'USER-003': 'phoneNumber',
} as const

const getMappedFieldName = (field: string) => {
  if (field in ONBOARDING_ERROR_FIELD_MAP) {
    return ONBOARDING_ERROR_FIELD_MAP[
      field as keyof typeof ONBOARDING_ERROR_FIELD_MAP
    ]
  }

  return undefined
}

const getDuplicatedFieldName = (code: string) => {
  if (code in DUPLICATED_FIELD_ERROR_CODE_MAP) {
    return DUPLICATED_FIELD_ERROR_CODE_MAP[
      code as keyof typeof DUPLICATED_FIELD_ERROR_CODE_MAP
    ]
  }

  return undefined
}

const applyProfileNewFieldErrors = (
  fieldErrors: FieldError[],
  { setFieldError }: ProfileNewOnboardingErrorHandlers,
) => {
  let hasMappedFieldError = false

  fieldErrors.forEach(({ field, reason }) => {
    const mappedFieldName = getMappedFieldName(field)

    if (!mappedFieldName) {
      return
    }

    setFieldError(mappedFieldName, reason)
    hasMappedFieldError = true
  })

  return hasMappedFieldError
}

export const applyProfileNewOnboardingError = (
  error: unknown,
  handlers: ProfileNewOnboardingErrorHandlers,
) => {
  if (!isApiError(error)) {
    return false
  }

  const duplicatedFieldName = getDuplicatedFieldName(error.code)

  if (duplicatedFieldName) {
    handlers.setFieldError(
      duplicatedFieldName,
      getErrorPresentation(error).message,
    )
    return true
  }

  if (error.code === 'COMMON-400') {
    const hasMappedFieldError = applyProfileNewFieldErrors(
      error.fieldErrors,
      handlers,
    )

    if (!hasMappedFieldError) {
      handlers.setFormError(getErrorPresentation(error).message)
    }

    return true
  }

  if (error.code === 'USER-004') {
    handlers.setFormError(getErrorPresentation(error).message)
    return true
  }

  return false
}
