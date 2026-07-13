import {
  createElement,
  lazy,
  Suspense,
  type ComponentType,
  type ReactNode,
  useEffect,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'

import { LoadingScreen } from '@/shared/components/loadingScreen'

const ROUTE_LOADING_DELAY_MS = 150
const ROUTE_LOADING_MIN_VISIBLE_MS = 300

type LazyRouteModule = {
  default: ComponentType
}

let wasRouteLoadingFallbackShown = false

const resetRouteLoadingFallbackShown = () => {
  wasRouteLoadingFallbackShown = false
}

const markRouteLoadingFallbackShown = () => {
  wasRouteLoadingFallbackShown = true
}

const wait = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const applyRouteLoadingTiming = async <T extends LazyRouteModule>(
  modulePromise: Promise<T>,
) => {
  const startedAt = Date.now()
  const module = await modulePromise
  const elapsedMs = Date.now() - startedAt
  const minimumPendingMs = ROUTE_LOADING_DELAY_MS + ROUTE_LOADING_MIN_VISIBLE_MS

  if (
    wasRouteLoadingFallbackShown &&
    elapsedMs >= ROUTE_LOADING_DELAY_MS &&
    elapsedMs < minimumPendingMs
  ) {
    await wait(minimumPendingMs - elapsedMs)
  }

  return module
}

const lazyRoute = <T extends LazyRouteModule>(importPage: () => Promise<T>) => {
  return lazy(() => applyRouteLoadingTiming(importPage()))
}

const RouteLoadingFallback = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    resetRouteLoadingFallbackShown()

    const timerId = setTimeout(() => {
      markRouteLoadingFallbackShown()
      setIsVisible(true)
    }, ROUTE_LOADING_DELAY_MS)

    return () => {
      clearTimeout(timerId)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return createElement(LoadingScreen)
}

const RouteLoadingBoundary = ({ children }: { children: ReactNode }) => {
  const location = useLocation()

  useEffect(() => {
    resetRouteLoadingFallbackShown()
  }, [location.key])

  return createElement(
    Suspense,
    { fallback: createElement(RouteLoadingFallback) },
    children,
  )
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

export const withLazyFallback = (element: ReactNode) => {
  return createElement(RouteLoadingBoundary, null, element)
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
