import { useCallback, useEffect, useRef, useState } from 'react'

import {
  checkIsSupportedProfileImageMimeType,
  PROFILE_IMAGE_MAX_FILE_SIZE_BYTES,
} from '@/features/profile/constants/profileImage'
import {
  checkIsValidBirthDate,
  checkIsValidEmail,
  checkIsValidPhoneNumber,
  formatBirthDateInput,
  formatPhoneNumberInput,
  normalizeDigits,
} from '@/features/profile/utils/profileForm'

type ProfileImageChange =
  | { type: 'keep' }
  | { type: 'replace'; file: File }
  | { type: 'delete' }

export interface ProfileDraft {
  profileImageChange: ProfileImageChange
  nickname: string
  birthDate: string
  phoneNumber: string
  englishName?: string
  email: string
}

interface UseProfileFormOptions {
  initialValues?: Partial<{
    profileImageUrl: string
    nickname: string
    birthDate: string
    phoneNumber: string
    englishName: string
    email: string
  }>
  requireChanges?: boolean
}

type ProfileFieldName =
  | 'nickname'
  | 'birthDate'
  | 'phoneNumber'
  | 'englishName'
  | 'email'

const PROFILE_IMAGE_INVALID_FILE_TYPE_ERROR_MESSAGE =
  '이미지 파일만 등록해주세요.'
const PROFILE_IMAGE_MAX_FILE_SIZE_ERROR_MESSAGE =
  '5MB 이하의 이미지만 등록해주세요.'

export const useProfileForm = ({
  initialValues = {},
  requireChanges = false,
}: UseProfileFormOptions = {}) => {
  // 재조회된 응답은 작성 중인 입력과 변경 비교 기준을 덮어쓰지 않습니다.
  const [initialProfile] = useState(() => ({ ...initialValues }))
  const [profileImageChange, setProfileImageChange] =
    useState<ProfileImageChange>({ type: 'keep' })
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState<
    string | undefined
  >(() => initialProfile.profileImageUrl)
  const profileImagePreviewUrlRef = useRef<string | undefined>(undefined)
  const [profileImageErrorMessage, setProfileImageErrorMessage] = useState('')
  const [nickname, setNickname] = useState(() => initialProfile.nickname ?? '')
  const [birthDate, setBirthDate] = useState(
    () => initialProfile.birthDate ?? '',
  )
  const [phoneNumber, setPhoneNumber] = useState(
    () => initialProfile.phoneNumber ?? '',
  )
  const [englishName, setEnglishName] = useState(
    () => initialProfile.englishName ?? '',
  )
  const [email, setEmail] = useState(() => initialProfile.email ?? '')
  const [touchedFields, setTouchedFields] = useState<Set<string>>(
    () => new Set(),
  )
  const [hasSubmitAttempted, setHasSubmitAttempted] = useState(false)
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Partial<Record<ProfileFieldName, string>>
  >({})
  const [formError, setFormError] = useState('')

  const normalizedBirthDate = normalizeDigits(birthDate).slice(0, 8)
  const normalizedPhoneNumber = normalizeDigits(phoneNumber).slice(0, 11)
  const trimmedNickname = nickname.trim()
  const trimmedEmail = email.trim()
  const trimmedEnglishName = englishName.trim()

  const isNicknameValid = trimmedNickname.length > 0
  const isBirthDateValid = checkIsValidBirthDate(normalizedBirthDate)
  const isPhoneNumberValid = checkIsValidPhoneNumber(normalizedPhoneNumber)
  const isEmailValid = checkIsValidEmail(trimmedEmail)
  const hasChanges =
    profileImageChange.type !== 'keep' ||
    trimmedNickname !== (initialProfile.nickname ?? '').trim() ||
    normalizedBirthDate !==
      normalizeDigits(initialProfile.birthDate ?? '').slice(0, 8) ||
    normalizedPhoneNumber !==
      normalizeDigits(initialProfile.phoneNumber ?? '').slice(0, 11) ||
    trimmedEnglishName !== (initialProfile.englishName ?? '').trim() ||
    trimmedEmail !== (initialProfile.email ?? '').trim()
  const isValid =
    isNicknameValid && isBirthDateValid && isPhoneNumberValid && isEmailValid
  const hasServerFieldError = Object.keys(serverFieldErrors).length > 0
  const canSubmit =
    isValid && !hasServerFieldError && (!requireChanges || hasChanges)
  // TODO: 중복 확인 API 연동 시 500ms debounce·blur 검사 상태를 포함하고, 수정 전 값은 검사에서 제외합니다.

  const checkShouldShowError = (fieldName: string) => {
    return hasSubmitAttempted || touchedFields.has(fieldName)
  }

  const fieldErrors = {
    nickname:
      serverFieldErrors.nickname ??
      (!isNicknameValid && checkShouldShowError('nickname')
        ? '닉네임을 입력해주세요.'
        : ''),
    birthDate:
      serverFieldErrors.birthDate ??
      (!isBirthDateValid && checkShouldShowError('birthDate')
        ? '생년월일을 정확히 입력해주세요.'
        : ''),
    phoneNumber:
      serverFieldErrors.phoneNumber ??
      (!isPhoneNumberValid && checkShouldShowError('phoneNumber')
        ? '연락처를 정확히 입력해주세요.'
        : ''),
    englishName: serverFieldErrors.englishName ?? '',
    email:
      serverFieldErrors.email ??
      (!isEmailValid && checkShouldShowError('email')
        ? '이메일을 정확히 입력해주세요.'
        : ''),
  }

  const markFieldTouched = (fieldName: string) => {
    setTouchedFields((currentTouchedFields) => {
      const nextTouchedFields = new Set(currentTouchedFields)
      nextTouchedFields.add(fieldName)
      return nextTouchedFields
    })
  }

  const clearServerFieldError = (fieldName: ProfileFieldName) => {
    setServerFieldErrors((currentServerFieldErrors) => {
      if (!currentServerFieldErrors[fieldName]) {
        return currentServerFieldErrors
      }

      const nextServerFieldErrors = { ...currentServerFieldErrors }
      delete nextServerFieldErrors[fieldName]
      return nextServerFieldErrors
    })
  }

  const clearFormError = () => {
    setFormError('')
  }

  const revokeProfileImagePreviewUrl = useCallback(() => {
    if (!profileImagePreviewUrlRef.current) {
      return
    }

    if (typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(profileImagePreviewUrlRef.current)
    }

    profileImagePreviewUrlRef.current = undefined
  }, [])

  const handleProfileImageChange = (file: File) => {
    if (!checkIsSupportedProfileImageMimeType(file.type)) {
      setProfileImageErrorMessage(PROFILE_IMAGE_INVALID_FILE_TYPE_ERROR_MESSAGE)
      return
    }

    if (file.size > PROFILE_IMAGE_MAX_FILE_SIZE_BYTES) {
      setProfileImageErrorMessage(PROFILE_IMAGE_MAX_FILE_SIZE_ERROR_MESSAGE)
      return
    }

    setProfileImageChange({ type: 'replace', file })
    setProfileImageErrorMessage('')
    clearFormError()

    if (typeof URL.createObjectURL === 'function') {
      const nextPreviewUrl = URL.createObjectURL(file)
      revokeProfileImagePreviewUrl()
      profileImagePreviewUrlRef.current = nextPreviewUrl
      setProfileImagePreviewUrl(nextPreviewUrl)
    }
  }

  const handleProfileImageDelete = () => {
    setProfileImageChange({
      type: initialProfile.profileImageUrl ? 'delete' : 'keep',
    })
    revokeProfileImagePreviewUrl()
    setProfileImagePreviewUrl(undefined)
    setProfileImageErrorMessage('')
    clearFormError()
  }

  useEffect(() => {
    return () => {
      revokeProfileImagePreviewUrl()
    }
  }, [revokeProfileImagePreviewUrl])

  const createProfileDraft = (): ProfileDraft | undefined => {
    setHasSubmitAttempted(true)
    setFormError('')

    if (!canSubmit) {
      return undefined
    }

    return {
      profileImageChange,
      nickname: trimmedNickname,
      birthDate: normalizedBirthDate,
      phoneNumber: normalizedPhoneNumber,
      englishName: trimmedEnglishName || undefined,
      email: trimmedEmail,
    }
  }

  const handleFieldServerError = (
    fieldName: ProfileFieldName,
    message: string,
  ) => {
    setServerFieldErrors((currentServerFieldErrors) => ({
      ...currentServerFieldErrors,
      [fieldName]: message,
    }))
  }

  return {
    profileImage: {
      previewUrl: profileImagePreviewUrl,
      onChange: handleProfileImageChange,
      onDelete: handleProfileImageDelete,
      errorMessage: profileImageErrorMessage,
    },
    fields: {
      nickname: {
        value: nickname,
        onValueChange: (value: string) => {
          clearServerFieldError('nickname')
          clearFormError()
          setNickname(value)
        },
        onBlur: () => markFieldTouched('nickname'),
        errorMessage: fieldErrors.nickname,
      },
      birthDate: {
        value: formatBirthDateInput(normalizedBirthDate),
        onValueChange: (value: string) => {
          clearServerFieldError('birthDate')
          clearFormError()
          setBirthDate(normalizeDigits(value).slice(0, 8))
        },
        onBlur: () => markFieldTouched('birthDate'),
        errorMessage: fieldErrors.birthDate,
      },
      phoneNumber: {
        value: formatPhoneNumberInput(normalizedPhoneNumber),
        onValueChange: (value: string) => {
          clearServerFieldError('phoneNumber')
          clearFormError()
          setPhoneNumber(normalizeDigits(value).slice(0, 11))
        },
        onBlur: () => markFieldTouched('phoneNumber'),
        errorMessage: fieldErrors.phoneNumber,
      },
      englishName: {
        value: englishName,
        onValueChange: (value: string) => {
          clearServerFieldError('englishName')
          clearFormError()
          setEnglishName(value)
        },
        errorMessage: fieldErrors.englishName,
      },
      email: {
        value: email,
        onValueChange: (value: string) => {
          clearServerFieldError('email')
          clearFormError()
          setEmail(value)
        },
        onBlur: () => markFieldTouched('email'),
        errorMessage: fieldErrors.email,
      },
    },
    formError,
    submit: {
      canSubmit,
      hasChanges,
      createProfileDraft,
      setFieldError: handleFieldServerError,
      setFormError,
    },
  }
}
