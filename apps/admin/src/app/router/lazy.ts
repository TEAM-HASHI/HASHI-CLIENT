import { lazy } from 'react'

export const lazyPages = {
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
