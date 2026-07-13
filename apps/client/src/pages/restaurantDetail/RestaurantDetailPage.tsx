import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'
import { getPathFromLocation } from '@/features/auth/utils/authRedirect'
import type { RestaurantMenuListData } from '@/features/restaurantDetail/api/getRestaurantMenus'
import type { RestaurantReviewListData } from '@/features/restaurantDetail/api/getRestaurantReviews'
import {
  REVIEW_PAGE_SIZE,
  type ReviewSortValue,
} from '@/features/restaurantDetail/constants/restaurantReview'
import {
  RestaurantDetailTemplate,
  type RestaurantDetailTab,
} from '@/features/restaurantDetail'
import {
  restaurantMenusInfiniteQueryOptions,
  restaurantReviewsInfiniteQueryOptions,
  restaurantStoreInformationQueryOptions,
  restaurantSummaryQueryOptions,
} from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import {
  getRestaurantDetailPath,
  getRestaurantDetailTabState,
  getRestaurantMenuDetailPath,
  getRestaurantReservationNewPath,
  navigateBackOrReplace,
} from '@/features/restaurantDetail/utils/restaurantDetailRoutes'
import { createRestaurantDetailViewModel } from '@/features/restaurantDetail/utils/createRestaurantDetailViewModel'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'
import { LoadingScreen } from '@/shared/components/loadingScreen'
import { checkIsNotFoundError } from '@/shared/api'
import { useAuthStatus, useInfiniteScrollTrigger } from '@/shared/hooks'
import { NotFoundPage } from '@/pages/notFound'

const RESTAURANT_DETAIL_MENU_PAGE_SIZE = 10

const parseRestaurantId = (restaurantId: string | undefined) => {
  const parsedRestaurantId = Number(restaurantId)

  return Number.isSafeInteger(parsedRestaurantId) && parsedRestaurantId > 0
    ? parsedRestaurantId
    : null
}

interface RestaurantDetailContentProps {
  restaurantId: number
}

const RestaurantDetailContent = ({
  restaurantId,
}: RestaurantDetailContentProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStatus()
  const { startKakaoOAuth } = useKakaoOAuthStart()
  const initialTab = getRestaurantDetailTabState(location.state).activeTab
  const [activeTab, setActiveTab] = useState<RestaurantDetailTab>(
    initialTab ?? 'info',
  )
  const [selectedReviewSort, setSelectedReviewSort] =
    useState<ReviewSortValue>('latest')
  const [isReviewImageViewerOpen, setIsReviewImageViewerOpen] = useState(false)
  const [reviewImageViewerImageUrls, setReviewImageViewerImageUrls] = useState<
    string[]
  >([])
  const [reviewImageViewerInitialIndex, setReviewImageViewerInitialIndex] =
    useState(0)
  const [isReviewUnavailableModalOpen, setIsReviewUnavailableModalOpen] =
    useState(false)
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false)
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)

  const summaryQuery = useQuery(restaurantSummaryQueryOptions(restaurantId))
  const storeInformationQuery = useQuery(
    restaurantStoreInformationQueryOptions(restaurantId),
  )
  const menusQuery = useInfiniteQuery(
    restaurantMenusInfiniteQueryOptions(
      restaurantId,
      RESTAURANT_DETAIL_MENU_PAGE_SIZE,
    ),
  )
  const reviewsQuery = useInfiniteQuery(
    restaurantReviewsInfiniteQueryOptions({
      restaurantId,
      size: REVIEW_PAGE_SIZE,
      sort: selectedReviewSort,
    }),
  )

  const canFetchNextMenuPage =
    menusQuery.hasNextPage && !menusQuery.isFetchingNextPage
  const canFetchNextReviewPage =
    reviewsQuery.hasNextPage && !reviewsQuery.isFetchingNextPage
  const { fetchNextPage: fetchNextMenuPage } = menusQuery
  const { fetchNextPage: fetchNextReviewPage } = reviewsQuery
  const handleIntersectMenu = useCallback(() => {
    if (canFetchNextMenuPage) {
      return fetchNextMenuPage()
    }
  }, [canFetchNextMenuPage, fetchNextMenuPage])
  const handleIntersectReview = useCallback(() => {
    if (canFetchNextReviewPage) {
      return fetchNextReviewPage()
    }
  }, [canFetchNextReviewPage, fetchNextReviewPage])
  const menuLoadMoreRef = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled: activeTab === 'menu' && canFetchNextMenuPage,
    isLoading: menusQuery.isFetchingNextPage,
    onIntersect: handleIntersectMenu,
  })
  const reviewLoadMoreRef = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled: activeTab === 'review' && canFetchNextReviewPage,
    isLoading: reviewsQuery.isFetchingNextPage,
    onIntersect: handleIntersectReview,
  })

  const requestError = summaryQuery.error ?? storeInformationQuery.error
  const summary = summaryQuery.data
  const storeInformation = storeInformationQuery.data
  const menuPages = menusQuery.data?.pages ?? []
  const reviewPages = reviewsQuery.data?.pages ?? []
  const isMenuListError = menusQuery.isError && menuPages.length === 0
  const isReviewListError = reviewsQuery.isError && reviewPages.length === 0

  if (requestError) {
    if (checkIsNotFoundError(requestError)) {
      return <NotFoundPage />
    }

    throw requestError
  }

  if (!summary || !storeInformation || menusQuery.isPending) {
    return <LoadingScreen />
  }

  const menus = menuPages.flatMap((page: RestaurantMenuListData) => page.menus)
  const reviews = reviewPages.flatMap(
    (page: RestaurantReviewListData) => page.reviews,
  )
  const firstReviewPage = reviewPages[0]
  const restaurant = createRestaurantDetailViewModel({
    summary,
    storeInformation,
    menus,
    reviews,
    averageRating: firstReviewPage?.averageRating ?? 0,
    reviewCount: firstReviewPage?.reviewCount ?? 0,
  })

  const handlePressBack = () => {
    navigateBackOrReplace(navigate, ROUTES.home)
  }

  const handlePressLike = () => {
    if (!isAuthenticated) {
      setIsAuthGateOpen(true)
      return
    }

    setIsComingSoonOpen(true)
  }

  const handlePressReservation = () => {
    if (!isAuthenticated) {
      setIsAuthGateOpen(true)
      return
    }

    navigate(getRestaurantReservationNewPath(restaurant.id))
  }

  const handlePressMenuItem = (menuId: string) => {
    navigate(getRestaurantMenuDetailPath(restaurant.id, menuId), {
      state: { source: 'detail' },
    })
  }

  const handlePressReviewImage = (reviewId: string, imageIndex: number) => {
    const selectedReview = restaurant.reviews.find(
      (review) => review.id === reviewId,
    )

    setReviewImageViewerImageUrls(selectedReview?.images ?? [])
    setReviewImageViewerInitialIndex(imageIndex)
    setIsReviewImageViewerOpen(true)
  }

  const handleCloseReviewImageViewer = () => {
    setIsReviewImageViewerOpen(false)
  }

  const handlePressWriteReview = () => {
    // TODO: 로그인/방문 여부에 따른 리뷰 작성 플로우 연결
    setIsReviewUnavailableModalOpen(true)
  }

  const handleCloseReviewUnavailableModal = () => {
    setIsReviewUnavailableModalOpen(false)
  }

  const handleSelectReviewSort = (sort: ReviewSortValue) => {
    setSelectedReviewSort(sort)
  }

  return (
    <>
      <RestaurantDetailTemplate
        activeTab={activeTab}
        hasMoreMenus={menusQuery.hasNextPage}
        hasMoreReviews={reviewsQuery.hasNextPage}
        isMenuListError={isMenuListError}
        isReviewListError={isReviewListError}
        isReviewImageViewerOpen={isReviewImageViewerOpen}
        isReviewListLoading={reviewsQuery.isPending}
        isReviewUnavailableModalOpen={isReviewUnavailableModalOpen}
        menuLoadMoreRef={menuLoadMoreRef}
        onCloseReviewImageViewer={handleCloseReviewImageViewer}
        onCloseReviewUnavailableModal={handleCloseReviewUnavailableModal}
        onPressBack={handlePressBack}
        onPressLike={handlePressLike}
        onPressMenuItem={handlePressMenuItem}
        onPressReservation={handlePressReservation}
        onPressReviewImage={handlePressReviewImage}
        onPressWriteReview={handlePressWriteReview}
        onRetryMenuList={() => void menusQuery.refetch()}
        onRetryReviewList={() => void reviewsQuery.refetch()}
        onSelectReviewSort={handleSelectReviewSort}
        onTabChange={setActiveTab}
        restaurant={restaurant}
        reviewImageViewerImageUrls={reviewImageViewerImageUrls}
        reviewImageViewerInitialIndex={reviewImageViewerInitialIndex}
        reviewLoadMoreRef={reviewLoadMoreRef}
        selectedReviewSort={selectedReviewSort}
        shareUrl={getRestaurantDetailPath(restaurant.id)}
        title="식당 상세 정보"
        variant="detail"
      />
      <AuthGateBottomSheet
        onKakaoPress={() => startKakaoOAuth(getPathFromLocation(location))}
        onOpenChange={setIsAuthGateOpen}
        open={isAuthGateOpen}
      />
      <ComingSoonDialog
        onOpenChange={setIsComingSoonOpen}
        open={isComingSoonOpen}
      />
    </>
  )
}

export const RestaurantDetailPage = () => {
  const { restaurantId } = useParams()
  const parsedRestaurantId = useMemo(
    () => parseRestaurantId(restaurantId),
    [restaurantId],
  )

  if (parsedRestaurantId === null) {
    return <NotFoundPage />
  }

  return <RestaurantDetailContent restaurantId={parsedRestaurantId} />
}
