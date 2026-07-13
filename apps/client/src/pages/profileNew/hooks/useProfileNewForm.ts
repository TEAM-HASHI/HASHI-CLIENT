import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  checkIsSupportedProfileImageMimeType,
  PROFILE_IMAGE_MAX_FILE_SIZE_BYTES,
} from '@/pages/profileNew/constants/profileImage'
import {
  checkIsValidBirthDate,
  checkIsValidEmail,
  checkIsValidPhoneNumber,
  formatBirthDateInput,
  formatPhoneNumberInput,
  normalizeDigits,
} from '@/pages/profileNew/utils/profileNewForm'

export interface ProfileDraft {
  profileImageFile?: File
  nickname: string
  birthDate: string
  phoneNumber: string
  englishName?: string
  email: string
}

interface UseProfileNewFormOptions {
  isSubmitting?: boolean
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

export const useProfileNewForm = ({
  isSubmitting = false,
}: UseProfileNewFormOptions = {}) => {
  const [profileImageFile, setProfileImageFile] = useState<File>()
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState<string>()
  const profileImagePreviewUrlRef = useRef<string | undefined>(undefined)
  const [profileImageErrorMessage, setProfileImageErrorMessage] = useState('')
  const [nickname, setNickname] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [englishName, setEnglishName] = useState('')
  const [email, setEmail] = useState('')
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
  const canSubmit =
    isNicknameValid &&
    isBirthDateValid &&
    isPhoneNumberValid &&
    isEmailValid &&
    !isSubmitting

  const checkShouldShowError = (fieldName: string) => {
    return hasSubmitAttempted || touchedFields.has(fieldName)
  }

  const fieldErrors = useMemo(
    () => ({
      nickname: serverFieldErrors.nickname ?? '',
      birthDate:
        serverFieldErrors.birthDate ??
        (normalizedBirthDate.length > 0 &&
        !isBirthDateValid &&
        checkShouldShowError('birthDate')
          ? '생년월일을 정확히 입력해주세요.'
          : ''),
      phoneNumber:
        serverFieldErrors.phoneNumber ??
        (normalizedPhoneNumber.length > 0 &&
        !isPhoneNumberValid &&
        checkShouldShowError('phoneNumber')
          ? '연락처를 정확히 입력해주세요.'
          : ''),
      englishName: serverFieldErrors.englishName ?? '',
      email:
        serverFieldErrors.email ??
        (trimmedEmail.length > 0 &&
        !isEmailValid &&
        checkShouldShowError('email')
          ? '이메일을 정확히 입력해주세요.'
          : ''),
    }),
    [
      hasSubmitAttempted,
      isBirthDateValid,
      isEmailValid,
      isPhoneNumberValid,
      normalizedBirthDate.length,
      normalizedPhoneNumber.length,
      serverFieldErrors.birthDate,
      serverFieldErrors.email,
      serverFieldErrors.englishName,
      serverFieldErrors.nickname,
      serverFieldErrors.phoneNumber,
      touchedFields,
      trimmedEmail.length,
    ],
  )

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

    setProfileImageFile(file)
    setProfileImageErrorMessage('')

    if (typeof URL.createObjectURL === 'function') {
      const nextPreviewUrl = URL.createObjectURL(file)
      revokeProfileImagePreviewUrl()
      profileImagePreviewUrlRef.current = nextPreviewUrl
      setProfileImagePreviewUrl(nextPreviewUrl)
    }
  }

  const handleProfileImageDelete = () => {
    setProfileImageFile(undefined)
    revokeProfileImagePreviewUrl()
    setProfileImagePreviewUrl(undefined)
    setProfileImageErrorMessage('')
  }

  useEffect(() => {
    return () => {
      revokeProfileImagePreviewUrl()
    }
  }, [revokeProfileImagePreviewUrl])

  const createProfileDraft = (): ProfileDraft | undefined => {
    setHasSubmitAttempted(true)
    setServerFieldErrors({})
    setFormError('')

    if (!canSubmit) {
      return undefined
    }

    return {
      profileImageFile,
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
          setNickname(value)
        },
        onBlur: () => markFieldTouched('nickname'),
        errorMessage: fieldErrors.nickname,
      },
      birthDate: {
        value: formatBirthDateInput(normalizedBirthDate),
        onValueChange: (value: string) => {
          clearServerFieldError('birthDate')
          setBirthDate(normalizeDigits(value).slice(0, 8))
        },
        onBlur: () => markFieldTouched('birthDate'),
        errorMessage: fieldErrors.birthDate,
      },
      phoneNumber: {
        value: formatPhoneNumberInput(normalizedPhoneNumber),
        onValueChange: (value: string) => {
          clearServerFieldError('phoneNumber')
          setPhoneNumber(normalizeDigits(value).slice(0, 11))
        },
        onBlur: () => markFieldTouched('phoneNumber'),
        errorMessage: fieldErrors.phoneNumber,
      },
      englishName: {
        value: englishName,
        onValueChange: (value: string) => {
          clearServerFieldError('englishName')
          setEnglishName(value)
        },
        errorMessage: fieldErrors.englishName,
      },
      email: {
        value: email,
        onValueChange: (value: string) => {
          clearServerFieldError('email')
          setEmail(value)
        },
        onBlur: () => markFieldTouched('email'),
        errorMessage: fieldErrors.email,
      },
    },
    formError,
    submit: {
      canSubmit,
      isSubmitting,
      createProfileDraft,
      setFieldError: handleFieldServerError,
      setFormError,
    },
  }
}
