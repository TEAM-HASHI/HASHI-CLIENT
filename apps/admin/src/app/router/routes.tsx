import { Suspense } from 'react'
import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { AdminLayout } from '@/app/layout/AdminLayout'
import { GuestOnlyRoute, AdminOnlyRoute } from '@/app/router/RouteGuards'
import { lazyPages } from '@/app/router/lazy'
import { ROUTES } from '@/app/router/path'
import { RouteLoading } from '@/shared/components/RouteLoading'

const {
  LoginPage,
  DashboardPage,
  RestaurantsPage,
  ReservationsPage,
  MagazinesPage,
} = lazyPages

const withSuspense = (element: ReactElement) => (
  <Suspense fallback={<RouteLoading />}>{element}</Suspense>
)

export const appRoutes = [
  {
    element: <GuestOnlyRoute />,
    children: [
      {
        path: ROUTES.login,
        element: withSuspense(<LoginPage />),
      },
    ],
  },
  {
    element: <AdminOnlyRoute />,
    children: [
      {
        path: ROUTES.adminRoot,
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.dashboard} replace />,
          },
          {
            path: ROUTES.dashboard,
            element: withSuspense(<DashboardPage />),
          },
          {
            path: ROUTES.restaurants,
            element: withSuspense(<RestaurantsPage />),
          },
          {
            path: ROUTES.reservations,
            element: withSuspense(<ReservationsPage />),
          },
          {
            path: ROUTES.magazines,
            element: withSuspense(<MagazinesPage />),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.adminRoot} replace />,
  },
]
