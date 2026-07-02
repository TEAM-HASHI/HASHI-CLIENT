import { createElement } from 'react'
import type { RouteObject } from 'react-router-dom'

import { BottomNavigationLayout } from '@/app/layout/BottomNavigationLayout'
import { RootLayout } from '@/app/layout/RootLayout'
import { lazyPages } from '@/app/router/lazy'
import { ROUTES } from '@/app/router/path'
import { AuthOnlyRoute, GuestOnlyRoute } from '@/app/router/RouteGuards'
import { HomePage } from '@/pages/home'

const notFound = () => lazyPages.notFound()

export const appRoutes: RouteObject[] = [
  {
    path: ROUTES.home,
    element: createElement(RootLayout),
    children: [
      {
        element: createElement(BottomNavigationLayout),
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
        element: lazyPages.comingSoon(),
      },
      {
        path: ROUTES.search,
        element: lazyPages.search(),
      },
      {
        path: ROUTES.todayRestaurant,
        element: lazyPages.todayRestaurant(),
      },
      {
        path: ROUTES.restaurantDetail,
        element: lazyPages.restaurantDetail(),
      },
      {
        path: ROUTES.hashiPickRestaurants,
        element: lazyPages.hashiPick(),
      },
      {
        path: ROUTES.popularRestaurants,
        element: lazyPages.popularRestaurants(),
      },
      {
        path: ROUTES.magazines,
        element: lazyPages.magazines(),
      },
      {
        path: ROUTES.magazineDetail,
        element: lazyPages.magazineDetail(),
      },
      {
        element: createElement(AuthOnlyRoute),
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
        element: createElement(GuestOnlyRoute),
        children: [
          {
            path: ROUTES.loginRequired,
            element: lazyPages.loginRequired(),
          },
        ],
      },
      {
        path: '*',
        element: notFound(),
      },
    ],
  },
]
