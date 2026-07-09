import { createElement, lazy, Suspense, type ReactNode } from 'react'

import { LoadingScreen } from '@/shared/components/loadingScreen'

const SearchPage = lazy(() => import('@/pages/search'))
const ComingSoonPage = lazy(() => import('@/pages/comingSoon'))
const TodayRestaurantPage = lazy(() => import('@/pages/todayRestaurant'))
const RestaurantDetailPage = lazy(() => import('@/pages/restaurantDetail'))
const RestaurantMenuDetailPage = lazy(
  () => import('@/pages/restaurantMenuDetail'),
)
const HashiPickPage = lazy(() => import('@/pages/hashiPick'))
const PopularRestaurantsPage = lazy(() => import('@/pages/popularRestaurants'))
const MagazinesPage = lazy(() => import('@/pages/magazines'))
const MagazineDetailPage = lazy(() => import('@/pages/magazineDetail'))
const ReviewNewPage = lazy(() => import('@/pages/reviewNew'))
const MyReviewsPage = lazy(() => import('@/pages/myReviews'))
const ReviewDetailPage = lazy(() => import('@/pages/reviewDetail'))
const ReviewEditPage = lazy(() => import('@/pages/reviewEdit'))
const MypagePage = lazy(() => import('@/pages/mypage'))
const ProfileNewPage = lazy(() => import('@/pages/profileNew'))
const WithdrawalPage = lazy(() => import('@/pages/withdrawal'))
const RestaurantReservationNewPage = lazy(
  () => import('@/pages/restaurantReservationNew'),
)
const AnywhereReservationPage = lazy(
  () => import('@/pages/anywhereReservation'),
)
const ReservationRequestPage = lazy(() => import('@/pages/reservationRequest'))
const MyReservationsPage = lazy(() => import('@/pages/myReservations'))
const ReservationDetailPage = lazy(() => import('@/pages/reservationDetail'))
const LoginRequiredPage = lazy(() => import('@/pages/loginRequired'))
const NotFoundPage = lazy(() => import('@/pages/notFound'))

const lazyPage = (Page: ReturnType<typeof lazy>) => {
  return createElement(Page)
}

export const withLazyFallback = (element: ReactNode) => {
  return createElement(
    Suspense,
    { fallback: createElement(LoadingScreen) },
    element,
  )
}

export const lazyPages = {
  comingSoon: () => lazyPage(ComingSoonPage),
  search: () => lazyPage(SearchPage),
  todayRestaurant: () => lazyPage(TodayRestaurantPage),
  restaurantDetail: () => lazyPage(RestaurantDetailPage),
  restaurantMenuDetail: () => lazyPage(RestaurantMenuDetailPage),
  hashiPick: () => lazyPage(HashiPickPage),
  popularRestaurants: () => lazyPage(PopularRestaurantsPage),
  magazines: () => lazyPage(MagazinesPage),
  magazineDetail: () => lazyPage(MagazineDetailPage),
  reviewNew: () => lazyPage(ReviewNewPage),
  myReviews: () => lazyPage(MyReviewsPage),
  reviewDetail: () => lazyPage(ReviewDetailPage),
  reviewEdit: () => lazyPage(ReviewEditPage),
  mypage: () => lazyPage(MypagePage),
  profileNew: () => lazyPage(ProfileNewPage),
  withdrawal: () => lazyPage(WithdrawalPage),
  restaurantReservationNew: () => lazyPage(RestaurantReservationNewPage),
  anywhereReservation: () => lazyPage(AnywhereReservationPage),
  reservationRequest: () => lazyPage(ReservationRequestPage),
  myReservations: () => lazyPage(MyReservationsPage),
  reservationDetail: () => lazyPage(ReservationDetailPage),
  loginRequired: () => lazyPage(LoginRequiredPage),
  notFound: () => lazyPage(NotFoundPage),
}
