import type { SyntheticEvent } from 'react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useProfileForm } from '@/features/profile/hooks/useProfileForm'
import { useProfileNewMutation } from '@/pages/profileNew/hooks/useProfileNewMutation'
import { useUploadedProfileImageKey } from '@/pages/profileNew/hooks/useUploadedProfileImageKey'
import { getAllowedProfileNewRedirectPath } from '@/pages/profileNew/utils/profileNewRedirect'

export const PROFILE_NEW_FORM_ID = 'profile-new-form'

export const useProfileNewPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [boundaryError, setBoundaryError] = useState<unknown>()
  const { getUploadedProfileImageKey } = useUploadedProfileImageKey()
  const form = useProfileForm()

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
  const isSubmitting = profileNewMutation.isPending

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) return

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
    isSubmitting,
  }
}
