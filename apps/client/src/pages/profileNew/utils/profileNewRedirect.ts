import { matchPath } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'

const ALLOWED_PROFILE_NEW_REDIRECT_ROUTES = [
  ROUTES.reviewNew,
  ROUTES.restaurantReservationNew,
  ROUTES.anywhereReservation,
  ROUTES.reservationRequest,
] as const

const REDIRECT_URL_BASE = 'https://hashi.local'

export const getAllowedProfileNewRedirectPath = (redirectTo: string | null) => {
  if (!redirectTo?.startsWith('/') || redirectTo.startsWith('//')) {
    return ROUTES.home
  }

  const redirectUrl = new URL(redirectTo, REDIRECT_URL_BASE)
  const isAllowedRedirectPath = ALLOWED_PROFILE_NEW_REDIRECT_ROUTES.some(
    (route) => matchPath({ path: route, end: true }, redirectUrl.pathname),
  )

  return isAllowedRedirectPath
    ? `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`
    : ROUTES.home
}
