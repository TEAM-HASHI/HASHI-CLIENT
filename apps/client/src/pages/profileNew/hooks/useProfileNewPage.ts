import type { SyntheticEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { useProfileNewForm } from '@/pages/profileNew/hooks/useProfileNewForm'

export const PROFILE_NEW_FORM_ID = 'profile-new-form'

const getSafeRedirectPath = (redirectTo: string | null) => {
  if (!redirectTo?.startsWith('/') || redirectTo.startsWith('//')) {
    return ROUTES.home
  }

  return redirectTo
}

export const useProfileNewPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const form = useProfileNewForm()

  const handleBackClick = () => {
    navigate(-1)
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    const profileDraft = form.submit.createProfileDraft()

    if (!profileDraft) {
      return
    }

    navigate(getSafeRedirectPath(searchParams.get('redirectTo')))
  }

  return {
    form,
    formId: PROFILE_NEW_FORM_ID,
    handleBackClick,
    handleSubmit,
  }
}
