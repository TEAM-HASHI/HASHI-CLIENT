import { createElement } from 'react'
import type { RouteObject } from 'react-router-dom'

import { BottomNavigationLayout } from '@/app/layout/BottomNavigationLayout'
import { RootLayout } from '@/app/layout/RootLayout'
import { lazyPages, withLazyFallback } from '@/app/router/lazy'
import { ROUTES } from '@/app/router/path'
import { AuthOnlyRoute, GuestOnlyRoute } from '@/app/router/RouteGuards'
import { HomePage } from '@/pages/home'

export const appRoutes: RouteObject[] = [
  {
    path: ROUTES.home,
    element: createElement(RootLayout),
    children: [
      {
        element: withLazyFallback(createElement(BottomNavigationLayout)),
        children: [
          {
            index: true,
            element: createElement(HomePage),
          },
          {
            path: ROUTES.map,
            element: lazyPages.comingSoon(),
          },
        ],
      },
      {
        path: ROUTES.comingSoon,
        element: withLazyFallback(lazyPages.comingSoon()),
      },
      {
        path: ROUTES.search,
        element: withLazyFallback(lazyPages.search()),
      },
      {
        path: ROUTES.todayRestaurant,
        element: withLazyFallback(lazyPages.todayRestaurant()),
      },
      {
        path: ROUTES.restaurantDetail,
        element: withLazyFallback(lazyPages.restaurantDetail()),
      },
      {
        path: ROUTES.restaurantMenuDetail,
        element: lazyPages.restaurantMenuDetail(),
      },
      {
        path: ROUTES.hashiPickRestaurants,
        element: withLazyFallback(lazyPages.hashiPick()),
      },
      {
        path: ROUTES.popularRestaurants,
        element: withLazyFallback(lazyPages.popularRestaurants()),
      },
      {
        path: ROUTES.magazines,
        element: withLazyFallback(lazyPages.magazines()),
      },
      {
        path: ROUTES.magazineDetail,
        element: withLazyFallback(lazyPages.magazineDetail()),
      },
      {
        path: ROUTES.kakaoOAuthCallback,
        element: withLazyFallback(lazyPages.kakaoOAuthCallback()),
      },
      {
        element: withLazyFallback(createElement(AuthOnlyRoute)),
        children: [
          {
            path: ROUTES.reviewNew,
            element: lazyPages.reviewNew(),
          },
          {
            path: ROUTES.myReviews,
            element: lazyPages.myReviews(),
          },
          {
            path: ROUTES.reviewDetail,
            element: lazyPages.reviewDetail(),
          },
          {
            path: ROUTES.reviewEdit,
            element: lazyPages.reviewEdit(),
          },
          {
            path: ROUTES.saved,
            element: createElement(BottomNavigationLayout),
            children: [
              {
                index: true,
                element: lazyPages.comingSoon(),
              },
            ],
          },
          {
            path: ROUTES.mypage,
            element: createElement(BottomNavigationLayout),
            children: [
              {
                index: true,
                element: lazyPages.mypage(),
              },
            ],
          },
          {
            path: ROUTES.myReservations,
            element: createElement(BottomNavigationLayout),
            children: [
              {
                index: true,
                element: lazyPages.myReservations(),
              },
            ],
          },
          {
            path: ROUTES.profileNew,
            element: lazyPages.profileNew(),
          },
          {
            path: ROUTES.withdrawal,
            element: lazyPages.withdrawal(),
          },
          {
            path: ROUTES.restaurantReservationNew,
            element: lazyPages.restaurantReservationNew(),
          },
          {
            path: ROUTES.anywhereReservation,
            element: lazyPages.anywhereReservation(),
          },
          {
            path: ROUTES.reservationRequest,
            element: lazyPages.reservationRequest(),
          },
          {
            path: ROUTES.reservationDetail,
            element: lazyPages.reservationDetail(),
          },
        ],
      },
      {
        element: withLazyFallback(createElement(GuestOnlyRoute)),
        children: [
          {
            path: ROUTES.loginRequired,
            element: createElement(BottomNavigationLayout),
            children: [
              {
                index: true,
                element: lazyPages.loginRequired(),
              },
            ],
          },
        ],
      },
      {
        element: withLazyFallback(createElement(BottomNavigationLayout)),
        children: [
          {
            path: '*',
            element: lazyPages.notFound(),
          },
        ],
      },
    ],
  },
]
