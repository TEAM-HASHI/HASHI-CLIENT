import type { SyntheticEvent } from 'react'
import { matchPath, useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { useProfileNewForm } from '@/pages/profileNew/hooks/useProfileNewForm'

export const PROFILE_NEW_FORM_ID = 'profile-new-form'

const ALLOWED_REDIRECT_ROUTES = [
  ROUTES.reviewNew,
  ROUTES.restaurantReservationNew,
  ROUTES.anywhereReservation,
  ROUTES.reservationRequest,
] as const

const getAllowedRedirectPath = (redirectTo: string | null) => {
  if (!redirectTo?.startsWith('/') || redirectTo.startsWith('//')) {
    return ROUTES.home
  }

  const isAllowedRedirectPath = ALLOWED_REDIRECT_ROUTES.some((route) =>
    matchPath({ path: route, end: true }, redirectTo),
  )

  return isAllowedRedirectPath ? redirectTo : ROUTES.home
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

    navigate(getAllowedRedirectPath(searchParams.get('redirectTo')))
  }

  return {
    form,
    formId: PROFILE_NEW_FORM_ID,
    handleBackClick,
    handleSubmit,
  }
}
