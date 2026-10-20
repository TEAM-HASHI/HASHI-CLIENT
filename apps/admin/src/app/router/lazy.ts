import { lazy } from 'react'

export const lazyPages = {
  RestaurantLocationsPage: lazy(() =>
    import('@/pages/restaurantLocations/RestaurantLocationsPage').then(
      ({ RestaurantLocationsPage }) => ({ default: RestaurantLocationsPage }),
    ),
  ),
  TermsPage: lazy(() =>
    import('@/pages/terms/TermsPage').then(({ TermsPage }) => ({
      default: TermsPage,
    })),
  ),
  TermsEditorPage: lazy(() =>
    import('@/pages/terms/TermsEditorPage').then(({ TermsEditorPage }) => ({
      default: TermsEditorPage,
    })),
  ),
  NoticesPage: lazy(() =>
    import('@/pages/notices/NoticesPage').then(({ NoticesPage }) => ({
      default: NoticesPage,
    })),
  ),
  NoticeEditorPage: lazy(() =>
    import('@/pages/notices/NoticeEditorPage').then(({ NoticeEditorPage }) => ({
      default: NoticeEditorPage,
    })),
  ),
  LoginPage: lazy(() =>
    import('@/pages/login/LoginPage').then(({ LoginPage }) => ({
      default: LoginPage,
    })),
  ),
  DashboardPage: lazy(() =>
    import('@/pages/dashboard/DashboardPage').then(({ DashboardPage }) => ({
      default: DashboardPage,
    })),
  ),
  UsersPage: lazy(() =>
    import('@/pages/users/UsersPage').then(({ UsersPage }) => ({
      default: UsersPage,
    })),
  ),
  RestaurantsPage: lazy(() =>
    import('@/pages/restaurants/RestaurantsPage').then(
      ({ RestaurantsPage }) => ({
        default: RestaurantsPage,
      }),
    ),
  ),
  ReservationsPage: lazy(() =>
    import('@/pages/reservations/ReservationsPage').then(
      ({ ReservationsPage }) => ({
        default: ReservationsPage,
      }),
    ),
  ),
  MagazinesPage: lazy(() =>
    import('@/pages/magazines/MagazinesPage').then(({ MagazinesPage }) => ({
      default: MagazinesPage,
    })),
  ),
} as const
