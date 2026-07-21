import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/app/router/path'
import { useAdminSession } from '@/shared/auth/useAdminSession'

export const AdminOnlyRoute = () => {
  const location = useLocation()
  const session = useAdminSession()

  if (!session) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return <Outlet />
}

export const GuestOnlyRoute = () => {
  const session = useAdminSession()

  if (session) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return <Outlet />
}
