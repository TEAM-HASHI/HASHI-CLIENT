import {
  index,
  layout,
  route,
  type RouteConfig,
} from '@react-router/dev/routes'

import { ROUTES } from './app/router/path'

const routePath = (path: string) => path.replace(/^\//, '')

export default [
  route('robots.txt', 'app/routes/robots.ts'),
  route('sitemap.xml', 'app/routes/sitemap.ts'),
  layout('app/routes/root-layout.tsx', [
    layout(
      'app/routes/bottom-navigation-layout.tsx',
      { id: 'routes/main-navigation' },
      [
        index('app/routes/home.tsx'),
        route(routePath(ROUTES.map), 'app/routes/coming-soon.tsx', {
          id: 'routes/map',
        }),
      ],
    ),
    route(routePath(ROUTES.comingSoon), 'app/routes/coming-soon.tsx', {
      id: 'routes/coming-soon',
    }),
    route(routePath(ROUTES.search), 'app/routes/search.tsx'),
    route(routePath(ROUTES.todayRestaurant), 'app/routes/today-restaurant.tsx'),
    route(
      routePath(ROUTES.restaurantDetail),
      'app/routes/restaurant-detail.tsx',
    ),
    route(
      routePath(ROUTES.restaurantMenuDetail),
      'app/routes/restaurant-menu-detail.tsx',
    ),
    route(routePath(ROUTES.hashiPickRestaurants), 'app/routes/hashi-pick.tsx'),
    route(routePath(ROUTES.popularRestaurants), 'app/routes/popular.tsx'),
    route(routePath(ROUTES.magazines), 'app/routes/magazines.tsx'),
    route(routePath(ROUTES.magazineDetail), 'app/routes/magazine-detail.tsx'),
    route(
      routePath(ROUTES.kakaoOAuthCallback),
      'app/routes/kakao-oauth-callback.tsx',
    ),
    layout('app/routes/auth-only-layout.tsx', [
      route(routePath(ROUTES.reviewNew), 'app/routes/review-new.tsx'),
      route(routePath(ROUTES.myReviews), 'app/routes/my-reviews.tsx'),
      route(routePath(ROUTES.reviewDetail), 'app/routes/review-detail.tsx'),
      route(routePath(ROUTES.reviewEdit), 'app/routes/review-edit.tsx'),
      route(
        routePath(ROUTES.saved),
        'app/routes/bottom-navigation-layout.tsx',
        { id: 'routes/saved-navigation' },
        [index('app/routes/coming-soon.tsx', { id: 'routes/saved' })],
      ),
      route(
        routePath(ROUTES.mypage),
        'app/routes/bottom-navigation-layout.tsx',
        { id: 'routes/mypage-navigation' },
        [index('app/routes/mypage.tsx')],
      ),
      route(
        routePath(ROUTES.myReservations),
        'app/routes/bottom-navigation-layout.tsx',
        { id: 'routes/my-reservations-navigation' },
        [index('app/routes/my-reservations.tsx')],
      ),
      route(routePath(ROUTES.profileNew), 'app/routes/profile-new.tsx'),
      route(routePath(ROUTES.withdrawal), 'app/routes/withdrawal.tsx'),
      route(
        routePath(ROUTES.restaurantReservationNew),
        'app/routes/restaurant-reservation-new.tsx',
      ),
      route(
        routePath(ROUTES.anywhereReservation),
        'app/routes/anywhere-reservation.tsx',
      ),
      route(
        routePath(ROUTES.reservationRequest),
        'app/routes/reservation-request.tsx',
      ),
      route(
        routePath(ROUTES.reservationDetail),
        'app/routes/reservation-detail.tsx',
      ),
    ]),
    layout('app/routes/guest-only-layout.tsx', [
      route(
        routePath(ROUTES.loginRequired),
        'app/routes/bottom-navigation-layout.tsx',
        { id: 'routes/login-required-navigation' },
        [index('app/routes/login-required.tsx')],
      ),
    ]),
    route(
      '*',
      'app/routes/bottom-navigation-layout.tsx',
      {
        id: 'routes/not-found-navigation',
      },
      [index('app/routes/not-found.tsx')],
    ),
  ]),
] satisfies RouteConfig
