import { useMutation } from '@tanstack/react-query'
import type { SyntheticEvent } from 'react'
import { useState } from 'react'
import { matchPath, useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { requestOnboarding } from '@/pages/profileNew/api/requestOnboarding'
import { uploadProfileImage } from '@/pages/profileNew/api/uploadProfileImage'
import {
  type ProfileDraft,
  useProfileNewForm,
} from '@/pages/profileNew/hooks/useProfileNewForm'
import { createOnboardingRequestBody } from '@/pages/profileNew/utils/profileNewForm'
import { isApiError } from '@/shared/api/apiError'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import type { FieldError } from '@/shared/api/types'

export const PROFILE_NEW_FORM_ID = 'profile-new-form'

const ALLOWED_REDIRECT_ROUTES = [
  ROUTES.reviewNew,
  ROUTES.restaurantReservationNew,
  ROUTES.anywhereReservation,
  ROUTES.reservationRequest,
] as const

const REDIRECT_URL_BASE = 'https://hashi.local'

const ONBOARDING_ERROR_FIELD_MAP = {
  nickname: 'nickname',
  birthDate: 'birthDate',
  phone: 'phoneNumber',
  email: 'email',
} as const

const DUPLICATED_FIELD_ERROR_CODE_MAP = {
  'USER-001': 'nickname',
  'USER-002': 'email',
  'USER-003': 'phoneNumber',
} as const

const getAllowedRedirectPath = (redirectTo: string | null) => {
  if (!redirectTo?.startsWith('/') || redirectTo.startsWith('//')) {
    return ROUTES.home
  }

  const redirectUrl = new URL(redirectTo, REDIRECT_URL_BASE)
  const isAllowedRedirectPath = ALLOWED_REDIRECT_ROUTES.some((route) =>
    matchPath({ path: route, end: true }, redirectUrl.pathname),
  )

  return isAllowedRedirectPath
    ? `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`
    : ROUTES.home
}

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

export const submitProfileNew = async (profileDraft: ProfileDraft) => {
  const profileImageKey = profileDraft.profileImageFile
    ? await uploadProfileImage(profileDraft.profileImageFile)
    : undefined

  return requestOnboarding(
    createOnboardingRequestBody(profileDraft, profileImageKey),
  )
}

export const useProfileNewPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [boundaryError, setBoundaryError] = useState<unknown>()

  const handleBackClick = () => {
    navigate(-1)
  }

  const applyFieldErrors = (fieldErrors: FieldError[]) => {
    let hasMappedFieldError = false

    fieldErrors.forEach(({ field, reason }) => {
      const mappedFieldName = getMappedFieldName(field)

      if (!mappedFieldName) {
        return
      }

      form.submit.setFieldError(mappedFieldName, reason)
      hasMappedFieldError = true
    })

    return hasMappedFieldError
  }

  const handleLocalOnboardingError = (error: unknown) => {
    if (!isApiError(error)) {
      return false
    }

    const duplicatedFieldName = getDuplicatedFieldName(error.code)

    if (duplicatedFieldName) {
      form.submit.setFieldError(
        duplicatedFieldName,
        getErrorPresentation(error).message,
      )
      return true
    }

    if (error.code === 'COMMON-400') {
      const hasMappedFieldError = applyFieldErrors(error.fieldErrors)

      if (!hasMappedFieldError) {
        form.submit.setFormError(getErrorPresentation(error).message)
      }

      return true
    }

    if (error.code === 'USER-004') {
      form.submit.setFormError(getErrorPresentation(error).message)
      return true
    }

    return false
  }

  const profileNewMutation = useMutation({
    mutationFn: submitProfileNew,
    onSuccess: () => {
      navigate(getAllowedRedirectPath(searchParams.get('redirectTo')))
    },
    onError: (error) => {
      if (!handleLocalOnboardingError(error)) {
        setBoundaryError(error)
      }
    },
  })
  const form = useProfileNewForm({
    isSubmitting: profileNewMutation.isPending,
  })

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    const profileDraft = form.submit.createProfileDraft()

    if (!profileDraft) {
      return
    }

    await profileNewMutation.mutateAsync(profileDraft).catch(() => undefined)
  }

  return {
    boundaryError,
    form,
    formId: PROFILE_NEW_FORM_ID,
    handleBackClick,
    handleSubmit,
  }
}
