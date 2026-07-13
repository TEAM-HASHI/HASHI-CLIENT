import { Navigate, Outlet, matchPath, useLocation } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { useAuthStatus } from '@/shared/hooks'

export const AuthOnlyRoute = () => {
  const location = useLocation()
  const { isAuthenticated, isOnboarding } = useAuthStatus()
  const isOnboardingRoute = Boolean(
    matchPath({ path: ROUTES.profileNew, end: true }, location.pathname),
  )
  const canAccessOnboardingRoute = isOnboarding && isOnboardingRoute

  if (isAuthenticated && isOnboardingRoute) {
    return <Navigate replace to={ROUTES.home} />
  }

  if (!isAuthenticated && !canAccessOnboardingRoute) {
    return (
      <Navigate replace state={{ from: location }} to={ROUTES.loginRequired} />
    )
  }

  return <Outlet />
}

export const GuestOnlyRoute = () => {
  const { isAuthenticated } = useAuthStatus()

  if (isAuthenticated) {
    return <Navigate replace to={ROUTES.home} />
  }

  return <Outlet />
}
