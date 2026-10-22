import type { SyntheticEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useProfileForm } from '@/features/profile/hooks/useProfileForm'
import { useProfileAvailability } from '@/features/profile/hooks/useProfileAvailability'
import { useProfileNewMutation } from '@/pages/profileNew/hooks/useProfileNewMutation'
import { useUploadedProfileImageKey } from '@/pages/profileNew/hooks/useUploadedProfileImageKey'
import { getAllowedProfileNewRedirectPath } from '@/pages/profileNew/utils/profileNewRedirect'

export const PROFILE_NEW_FORM_ID = 'profile-new-form'

export const useProfileNewPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { getUploadedProfileImageKey } = useUploadedProfileImageKey()
  const form = useProfileForm()
  const availability = useProfileAvailability({
    nickname: form.fields.nickname.value,
    phoneNumber: form.fields.phoneNumber.value,
    email: form.fields.email.value,
  })

  const handleBackClick = () => {
    navigate(-1)
  }

  const profileNewMutation = useProfileNewMutation({
    getRedirectPath: () =>
      getAllowedProfileNewRedirectPath(searchParams.get('redirectTo')),
    getUploadedProfileImageKey,
    navigateTo: navigate,
    setFieldError: (...args) => form.submit.setFieldError(...args),
    setFormError: (message) => form.submit.setFormError(message),
  })
  const isSubmitting = profileNewMutation.isPending
  const canSubmit =
    form.submit.canSubmit && availability.canSubmit && !isSubmitting

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmit) return

    const profileDraft = form.submit.createProfileDraft()

    if (!profileDraft) {
      return
    }

    await profileNewMutation.mutateAsync(profileDraft).catch(() => undefined)
  }

  return {
    form,
    fields: availability.bindFields(form.fields),
    canSubmit,
    formId: PROFILE_NEW_FORM_ID,
    handleBackClick,
    handleSubmit,
    isSubmitting,
  }
}
