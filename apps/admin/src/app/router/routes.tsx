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
  UsersPage,
  RestaurantsPage,
  RestaurantLocationsPage,
  ReservationsPage,
  MagazinesPage,
  NoticesPage,
  NoticeEditorPage,
  TermsPage,
  TermsEditorPage,
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
            path: ROUTES.restaurantLocations,
            element: withSuspense(<RestaurantLocationsPage />),
          },
          { path: ROUTES.terms, element: withSuspense(<TermsPage />) },
          { path: ROUTES.termsNew, element: withSuspense(<TermsEditorPage />) },
          {
            path: ROUTES.termsDetail,
            element: withSuspense(<TermsEditorPage />),
          },
          { path: ROUTES.notices, element: withSuspense(<NoticesPage />) },
          {
            path: ROUTES.noticeNew,
            element: withSuspense(<NoticeEditorPage />),
          },
          {
            path: ROUTES.noticeDetail,
            element: withSuspense(<NoticeEditorPage />),
          },
          {
            index: true,
            element: <Navigate to={ROUTES.dashboard} replace />,
          },
          {
            path: ROUTES.dashboard,
            element: withSuspense(<DashboardPage />),
          },
          {
            path: ROUTES.users,
            element: withSuspense(<UsersPage />),
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
