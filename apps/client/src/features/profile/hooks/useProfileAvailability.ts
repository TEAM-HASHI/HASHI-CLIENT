import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import type { useProfileForm } from '@/features/profile/hooks/useProfileForm'
import {
  checkIsValidEmail,
  checkIsValidPhoneNumber,
  normalizeDigits,
} from '@/features/profile/utils/profileForm'
import {
  checkProfileAvailability,
  type AvailabilityField,
} from '@/features/profile/api/checkProfileAvailability'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import { isApiError } from '@/shared/api/apiError'
import { getAuthSessionVersion } from '@/shared/auth/authSession'

const PROFILE_AVAILABILITY_DEBOUNCE_MS = 500

interface ProfileValues {
  nickname: string
  phoneNumber: string
  email: string
}

const EMPTY_PROFILE_VALUES: ProfileValues = {
  nickname: '',
  phoneNumber: '',
  email: '',
}

const useFieldAvailability = (
  field: AvailabilityField,
  value: string,
  initialValue: string,
  isValid: boolean,
) => {
  const [readyValue, setReadyValue] = useState(initialValue)
  const needsCheck = value !== initialValue && isValid
  const query = useQuery({
    queryKey: [
      'user',
      'profileAvailability',
      getAuthSessionVersion(),
      field,
      value,
    ],
    queryFn: ({ signal }) => checkProfileAvailability(field, value, signal),
    enabled: needsCheck && readyValue === value,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    throwOnError: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  useEffect(() => {
    if (!needsCheck) return
    const timer = setTimeout(
      () => setReadyValue(value),
      PROFILE_AVAILABILITY_DEBOUNCE_MS,
    )
    return () => clearTimeout(timer)
  }, [needsCheck, value])

  const validationMessage =
    isApiError(query.error) && query.error.code === 'COMMON-400'
      ? query.error.fieldErrors.find((error) => error.field === field)?.reason
      : undefined
  return {
    canSubmit:
      !needsCheck ||
      (readyValue === value &&
        query.isSuccess &&
        !query.isFetching &&
        query.data.available),
    errorMessage:
      !needsCheck || readyValue !== value
        ? ''
        : query.isError
          ? (validationMessage ?? getErrorPresentation(query.error).message)
          : (query.data?.message ?? ''),
    onBlur: () => {
      if (!needsCheck) return
      setReadyValue(value)
      if (readyValue === value && query.isError) void query.refetch()
    },
  }
}

export const useProfileAvailability = (
  values: ProfileValues,
  initial: ProfileValues = EMPTY_PROFILE_VALUES,
) => {
  const nickname = useFieldAvailability(
    'nickname',
    values.nickname.trim(),
    initial.nickname.trim(),
    values.nickname.trim().length > 0,
  )
  const phoneNumber = useFieldAvailability(
    'phone',
    normalizeDigits(values.phoneNumber),
    normalizeDigits(initial.phoneNumber),
    checkIsValidPhoneNumber(values.phoneNumber),
  )
  const email = useFieldAvailability(
    'email',
    values.email.trim(),
    initial.email.trim(),
    checkIsValidEmail(values.email),
  )
  const checks = { nickname, phoneNumber, email }
  return {
    nickname,
    phoneNumber,
    email,
    canSubmit: nickname.canSubmit && phoneNumber.canSubmit && email.canSubmit,
    bindFields: (fields: ReturnType<typeof useProfileForm>['fields']) => {
      const bind = (field: keyof ProfileValues) => ({
        ...fields[field],
        onBlur: () => {
          fields[field].onBlur()
          checks[field].onBlur()
        },
        errorMessage: fields[field].errorMessage || checks[field].errorMessage,
      })
      return {
        ...fields,
        nickname: bind('nickname'),
        phoneNumber: bind('phoneNumber'),
        email: bind('email'),
      }
    },
  }
}
