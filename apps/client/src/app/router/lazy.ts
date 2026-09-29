import { createElement, lazy, type ComponentType } from 'react'

import { loadRouteChunk } from '@/app/router/routeLoadingPolicy'

type LazyRouteModule = {
  default: ComponentType
}

const lazyRoute = <T extends LazyRouteModule>(importPage: () => Promise<T>) => {
  return lazy(() => loadRouteChunk(importPage))
}

const SearchPage = lazyRoute(() => import('@/pages/search'))
const ComingSoonPage = lazyRoute(() => import('@/pages/comingSoon'))
const TodayRestaurantPage = lazyRoute(() => import('@/pages/todayRestaurant'))
const RestaurantDetailPage = lazyRoute(() => import('@/pages/restaurantDetail'))
const RestaurantMenuDetailPage = lazyRoute(
  () => import('@/pages/restaurantMenuDetail'),
)
const HashiPickPage = lazyRoute(() => import('@/pages/hashiPick'))
const PopularRestaurantsPage = lazyRoute(
  () => import('@/pages/popularRestaurants'),
)
const MagazinesPage = lazyRoute(() => import('@/pages/magazines'))
const MagazineDetailPage = lazyRoute(() => import('@/pages/magazineDetail'))
const ReviewNewPage = lazyRoute(() => import('@/pages/reviewNew'))
const MyReviewsPage = lazyRoute(() => import('@/pages/myReviews'))
const ReviewDetailPage = lazyRoute(() => import('@/pages/reviewDetail'))
const ReviewEditPage = lazyRoute(() => import('@/pages/reviewEdit'))
const MypagePage = lazyRoute(() => import('@/pages/mypage'))
const ProfileNewPage = lazyRoute(() => import('@/pages/profileNew'))
const WithdrawalPage = lazyRoute(() => import('@/pages/withdrawal'))
const RestaurantReservationNewPage = lazyRoute(
  () => import('@/pages/restaurantReservationNew'),
)
const AnywhereReservationPage = lazyRoute(
  () => import('@/pages/anywhereReservation'),
)
const ReservationRequestPage = lazyRoute(
  () => import('@/pages/reservationRequest'),
)
const MyReservationsPage = lazyRoute(() => import('@/pages/myReservations'))
const ReservationDetailPage = lazyRoute(
  () => import('@/pages/reservationDetail'),
)
const LoginRequiredPage = lazyRoute(() => import('@/pages/loginRequired'))
const KakaoOAuthCallbackPage = lazyRoute(
  () => import('@/pages/kakaoOAuthCallback'),
)
const NotFoundPage = lazyRoute(() => import('@/pages/notFound'))

const lazyPage = (Page: ReturnType<typeof lazy>) => {
  return createElement(Page)
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
  kakaoOAuthCallback: () => lazyPage(KakaoOAuthCallbackPage),
  notFound: () => lazyPage(NotFoundPage),
}
