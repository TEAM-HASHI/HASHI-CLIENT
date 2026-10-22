import { createElement, lazy, type ComponentType } from 'react'

import { loadRouteChunk } from '@/app/router/routeLoadingPolicy'

type LazyRouteModule = {
  default: ComponentType
}

const lazyRoute = <T extends LazyRouteModule>(importPage: () => Promise<T>) => {
  return lazy(() => loadRouteChunk(importPage))
}

const SearchPage = lazyRoute(() => import('@/pages/search'))
const MapPage = lazyRoute(() => import('@/pages/map'))
const CollectionFormPage = lazyRoute(() =>
  import('@/pages/saved/CollectionFormPage').then((module) => ({
    default: module.CollectionFormPage,
  })),
)
const CollectionEditorPage = lazyRoute(() =>
  import('@/pages/saved/CollectionEditorPage').then((module) => ({
    default: module.CollectionEditorPage,
  })),
)
const SavedPage = lazyRoute(() => import('@/pages/saved'))
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
const HotSnsRestaurantsPage = lazyRoute(
  () => import('@/pages/hotSnsRestaurants'),
)
const MagazinesPage = lazyRoute(() => import('@/pages/magazines'))
const MagazineDetailPage = lazyRoute(() => import('@/pages/magazineDetail'))
const ReviewNewPage = lazyRoute(() => import('@/pages/reviewNew'))
const MyReviewsPage = lazyRoute(() => import('@/pages/myReviews'))
const ReviewDetailPage = lazyRoute(() => import('@/pages/reviewDetail'))
const ReviewEditPage = lazyRoute(() => import('@/pages/reviewEdit'))
const MypagePage = lazyRoute(() => import('@/pages/mypage'))
const ProfileNewPage = lazyRoute(() => import('@/pages/profileNew'))
const ProfileEditPage = lazyRoute(() => import('@/pages/profileEdit'))
const WithdrawalPage = lazyRoute(() => import('@/pages/withdrawal'))
const NoticesPage = lazyRoute(() => import('@/pages/notices'))
const NoticeDetailPage = lazyRoute(() => import('@/pages/noticeDetail'))
const TermsPage = lazyRoute(() => import('@/pages/terms'))
const TermsDetailPage = lazyRoute(() => import('@/pages/termsDetail'))
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
const ReservationCompletePage = lazyRoute(
  () => import('@/pages/reservationComplete'),
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
  map: () => lazyPage(MapPage),
  saved: () => lazyPage(SavedPage),
  collectionForm: () => lazyPage(CollectionFormPage),
  collectionEditor: () => lazyPage(CollectionEditorPage),
  comingSoon: () => lazyPage(ComingSoonPage),
  search: () => lazyPage(SearchPage),
  todayRestaurant: () => lazyPage(TodayRestaurantPage),
  restaurantDetail: () => lazyPage(RestaurantDetailPage),
  restaurantMenuDetail: () => lazyPage(RestaurantMenuDetailPage),
  hashiPick: () => lazyPage(HashiPickPage),
  popularRestaurants: () => lazyPage(PopularRestaurantsPage),
  hotSnsRestaurants: () => lazyPage(HotSnsRestaurantsPage),
  magazines: () => lazyPage(MagazinesPage),
  magazineDetail: () => lazyPage(MagazineDetailPage),
  reviewNew: () => lazyPage(ReviewNewPage),
  myReviews: () => lazyPage(MyReviewsPage),
  reviewDetail: () => lazyPage(ReviewDetailPage),
  reviewEdit: () => lazyPage(ReviewEditPage),
  mypage: () => lazyPage(MypagePage),
  profileNew: () => lazyPage(ProfileNewPage),
  profileEdit: () => lazyPage(ProfileEditPage),
  withdrawal: () => lazyPage(WithdrawalPage),
  notices: () => lazyPage(NoticesPage),
  noticeDetail: () => lazyPage(NoticeDetailPage),
  terms: () => lazyPage(TermsPage),
  termsDetail: () => lazyPage(TermsDetailPage),
  restaurantReservationNew: () => lazyPage(RestaurantReservationNewPage),
  anywhereReservation: () => lazyPage(AnywhereReservationPage),
  reservationRequest: () => lazyPage(ReservationRequestPage),
  myReservations: () => lazyPage(MyReservationsPage),
  reservationDetail: () => lazyPage(ReservationDetailPage),
  reservationComplete: () => lazyPage(ReservationCompletePage),
  loginRequired: () => lazyPage(LoginRequiredPage),
  kakaoOAuthCallback: () => lazyPage(KakaoOAuthCallbackPage),
  notFound: () => lazyPage(NotFoundPage),
}
