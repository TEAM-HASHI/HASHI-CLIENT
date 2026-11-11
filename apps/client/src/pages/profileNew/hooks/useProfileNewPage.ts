import { useState, type SyntheticEvent } from 'react'
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
  // TODO: 초대자 코드 검증 API와 온보딩 요청 필드가 나오면 연결한다.
  // 지금은 입력만 받고 서버로 보내지 않는다.
  const [inviteCode, setInviteCode] = useState('')
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
    fields: {
      ...availability.bindFields(form.fields),
      inviteCode: { value: inviteCode, onValueChange: setInviteCode },
    },
    canSubmit,
    formId: PROFILE_NEW_FORM_ID,
    handleBackClick,
    handleSubmit,
    isSubmitting,
  }
}
