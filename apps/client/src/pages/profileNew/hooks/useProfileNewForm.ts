import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { duplicatedNicknames } from '@/pages/profileNew/mocks/profileNew.mock'
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
  isProfileImageDeleted: boolean
  nickname: string
  birthDate: string
  phoneNumber: string
  englishName?: string
  email: string
}

const DUPLICATED_NICKNAMES = new Set(duplicatedNicknames)
const PROFILE_IMAGE_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const PROFILE_IMAGE_INVALID_FILE_TYPE_ERROR_MESSAGE =
  '이미지 파일만 등록해주세요.'
const PROFILE_IMAGE_MAX_FILE_SIZE_ERROR_MESSAGE =
  '5MB 이하의 이미지만 등록해주세요.'

export const useProfileNewForm = () => {
  const [profileImageFile, setProfileImageFile] = useState<File>()
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState<string>()
  const profileImagePreviewUrlRef = useRef<string | undefined>(undefined)
  const [profileImageErrorMessage, setProfileImageErrorMessage] = useState('')
  const [isProfileImageDeleted, setIsProfileImageDeleted] = useState(false)
  const [nickname, setNickname] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [englishName, setEnglishName] = useState('')
  const [email, setEmail] = useState('')
  const [touchedFields, setTouchedFields] = useState<Set<string>>(
    () => new Set(),
  )
  const [hasSubmitAttempted, setHasSubmitAttempted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Partial<Record<'nickname' | 'birthDate' | 'phoneNumber' | 'email', string>>
  >({})
  const [formError, setFormError] = useState('')

  const normalizedBirthDate = normalizeDigits(birthDate).slice(0, 8)
  const normalizedPhoneNumber = normalizeDigits(phoneNumber).slice(0, 11)
  const trimmedNickname = nickname.trim()
  const trimmedEmail = email.trim()
  const trimmedEnglishName = englishName.trim()

  const isNicknameDuplicated = DUPLICATED_NICKNAMES.has(trimmedNickname)
  const isNicknameValid = trimmedNickname.length > 0 && !isNicknameDuplicated
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
      nickname: isNicknameDuplicated
        ? '중복된 네이밍입니다.'
        : (serverFieldErrors.nickname ?? ''),
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
      isNicknameDuplicated,
      isPhoneNumberValid,
      normalizedBirthDate.length,
      normalizedPhoneNumber.length,
      serverFieldErrors.birthDate,
      serverFieldErrors.email,
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

  const clearServerFieldError = (
    fieldName: 'nickname' | 'birthDate' | 'phoneNumber' | 'email',
  ) => {
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
    if (!file.type.startsWith('image/')) {
      setProfileImageErrorMessage(PROFILE_IMAGE_INVALID_FILE_TYPE_ERROR_MESSAGE)
      return
    }

    if (file.size > PROFILE_IMAGE_MAX_FILE_SIZE_BYTES) {
      setProfileImageErrorMessage(PROFILE_IMAGE_MAX_FILE_SIZE_ERROR_MESSAGE)
      return
    }

    setProfileImageFile(file)
    setIsProfileImageDeleted(false)
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
    setIsProfileImageDeleted(false)
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
      isProfileImageDeleted,
      nickname: trimmedNickname,
      birthDate: normalizedBirthDate,
      phoneNumber: normalizedPhoneNumber,
      englishName: trimmedEnglishName || undefined,
      email: trimmedEmail,
    }
  }

  const handleFieldServerError = (
    fieldName: 'nickname' | 'birthDate' | 'phoneNumber' | 'email',
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
        onValueChange: setEnglishName,
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
      setSubmitting: setIsSubmitting,
    },
  }
}
