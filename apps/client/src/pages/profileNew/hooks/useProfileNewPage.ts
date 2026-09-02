import type { SyntheticEvent } from 'react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useProfileNewForm } from '@/pages/profileNew/hooks/useProfileNewForm'
import { useProfileNewMutation } from '@/pages/profileNew/hooks/useProfileNewMutation'
import { useUploadedProfileImageKey } from '@/pages/profileNew/hooks/useUploadedProfileImageKey'
import { getAllowedProfileNewRedirectPath } from '@/pages/profileNew/utils/profileNewRedirect'

export const PROFILE_NEW_FORM_ID = 'profile-new-form'

export const useProfileNewPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [boundaryError, setBoundaryError] = useState<unknown>()
  const { getUploadedProfileImageKey } = useUploadedProfileImageKey()

  const handleBackClick = () => {
    navigate(-1)
  }

  const profileNewMutation = useProfileNewMutation({
    getRedirectPath: () =>
      getAllowedProfileNewRedirectPath(searchParams.get('redirectTo')),
    getUploadedProfileImageKey,
    navigateTo: navigate,
    onUnhandledError: setBoundaryError,
    setFieldError: (...args) => form.submit.setFieldError(...args),
    setFormError: (message) => form.submit.setFormError(message),
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
