import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'
import { getPathFromLocation } from '@/features/auth/utils/authRedirect'
import {
  RestaurantDetailTemplate,
  type RestaurantDetailTab,
} from '@/features/restaurantDetail'
import { getRandomRestaurantRecommendation } from '@/features/restaurantDetail/api/getRandomRestaurantRecommendation'
import type { RestaurantMenuListData } from '@/features/restaurantDetail/api/getRestaurantMenus'
import type { RestaurantReviewListData } from '@/features/restaurantDetail/api/getRestaurantReviews'
import type { RestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import {
  REVIEW_PAGE_SIZE,
  type ReviewSortValue,
} from '@/features/restaurantDetail/constants/restaurantReview'
import {
  randomRestaurantRecommendationQueryOptions,
  restaurantMenusInfiniteQueryOptions,
  restaurantReviewsInfiniteQueryOptions,
  restaurantStoreInformationQueryOptions,
} from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import {
  getRestaurantDetailTabState,
  getRestaurantMenuDetailPath,
  getRestaurantReservationNewPath,
  navigateBackOrReplace,
} from '@/features/restaurantDetail/utils/restaurantDetailRoutes'
import { createRestaurantDetailViewModel } from '@/features/restaurantDetail/utils/createRestaurantDetailViewModel'
import { NotFoundPage } from '@/pages/notFound'
import { checkIsNotFoundError } from '@/shared/api'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'
import { LoadingScreen } from '@/shared/components/loadingScreen'
import { useAuthStatus, useInfiniteScrollTrigger } from '@/shared/hooks'

const TODAY_RESTAURANT_MENU_PAGE_SIZE = 10

export const TodayRestaurantPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStatus()
  const { startKakaoOAuth } = useKakaoOAuthStart()
  const initialTab = getRestaurantDetailTabState(location.state).activeTab
  const [activeTab, setActiveTab] = useState<RestaurantDetailTab>(
    initialTab ?? 'info',
  )
  const [recommendedSummary, setRecommendedSummary] =
    useState<RestaurantSummary | null>(null)
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

  const randomRecommendationQuery = useQuery(
    randomRestaurantRecommendationQueryOptions(),
  )
  const recommendAgainMutation = useMutation({
    mutationFn: ({ excludeRestaurantId }: { excludeRestaurantId?: number }) =>
      getRandomRestaurantRecommendation(
        excludeRestaurantId === undefined ? undefined : { excludeRestaurantId },
      ),
    onSuccess: (nextSummary) => {
      setRecommendedSummary(nextSummary)
      setActiveTab('info')
      setSelectedReviewSort('latest')
      setIsReviewImageViewerOpen(false)
    },
  })
  const summary = recommendedSummary ?? randomRecommendationQuery.data
  const restaurantId = summary?.restaurantId ?? 0
  const hasRestaurantId = restaurantId > 0
  const storeInformationQuery = useQuery({
    ...restaurantStoreInformationQueryOptions(restaurantId),
    enabled: hasRestaurantId,
  })
  const menusQuery = useInfiniteQuery({
    ...restaurantMenusInfiniteQueryOptions(
      restaurantId,
      TODAY_RESTAURANT_MENU_PAGE_SIZE,
    ),
    enabled: hasRestaurantId,
  })
  const reviewsQuery = useInfiniteQuery({
    ...restaurantReviewsInfiniteQueryOptions({
      restaurantId,
      size: REVIEW_PAGE_SIZE,
      sort: selectedReviewSort,
    }),
    enabled: hasRestaurantId,
  })
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
  const requestError =
    randomRecommendationQuery.error ??
    recommendAgainMutation.error ??
    storeInformationQuery.error
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

  if (
    randomRecommendationQuery.isPending ||
    !summary ||
    !storeInformation ||
    menusQuery.isPending
  ) {
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

  const handlePressRecommendAgain = () => {
    if (recommendAgainMutation.isPending) {
      return
    }

    recommendAgainMutation.mutate({
      excludeRestaurantId: restaurant.id ? Number(restaurant.id) : undefined,
    })
  }

  const handlePressMenuItem = (menuId: string) => {
    navigate(getRestaurantMenuDetailPath(restaurant.id, menuId), {
      state: { source: 'today' },
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
        onPressRecommendAgain={handlePressRecommendAgain}
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
        shareUrl={ROUTES.todayRestaurant}
        title="오늘의 식당"
        variant="today"
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
