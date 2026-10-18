import { type SyntheticEvent, useState } from 'react'

import { useProfileForm } from '@/features/profile/hooks/useProfileForm'
import type { MyInfo } from '@/features/user/api/getMyInfo'
import { useProfileAvailability } from '@/features/profile/hooks/useProfileAvailability'
import { useProfileEditMutation } from '@/pages/profileEdit/hooks/useProfileEditMutation'

export const useProfileEditPage = (profile: MyInfo) => {
  const [initial] = useState(() => ({ ...profile }))
  const form = useProfileForm({
    initialValues: {
      ...initial,
      profileImageUrl: initial.profileImageUrl ?? undefined,
    },
    requireChanges: true,
  })
  const availability = useProfileAvailability(
    {
      nickname: form.fields.nickname.value,
      phoneNumber: form.fields.phoneNumber.value,
      email: form.fields.email.value,
    },
    initial,
  )
  const mutation = useProfileEditMutation(initial, form.submit)
  const canSubmit =
    mutation.isCurrentSession &&
    form.submit.canSubmit &&
    availability.canSubmit &&
    !mutation.isPending

  return {
    form,
    fields: availability.bindFields(form.fields),
    canSubmit,
    isSubmitting: mutation.isPending,
    handleBack: mutation.handleBack,
    handleSubmit: (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!canSubmit) return
      const draft = form.submit.createProfileDraft()
      if (draft) mutation.submit(draft)
    },
  }
}
