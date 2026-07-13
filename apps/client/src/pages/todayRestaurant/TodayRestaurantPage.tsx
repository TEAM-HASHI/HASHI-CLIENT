import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'
import { getPathFromLocation } from '@/features/auth/utils/authRedirect'
import { RestaurantDetailTemplate } from '@/features/restaurantDetail'
import { getRandomRestaurantRecommendation } from '@/features/restaurantDetail/api/getRandomRestaurantRecommendation'
import type { RestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import { useRestaurantDetailContent } from '@/features/restaurantDetail/hooks/useRestaurantDetailContent'
import { randomRestaurantRecommendationQueryOptions } from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import {
  getRestaurantDetailTabState,
  getRestaurantMenuDetailPath,
  getRestaurantReservationNewPath,
  navigateBackOrReplace,
} from '@/features/restaurantDetail/utils/restaurantDetailRoutes'
import { NotFoundPage } from '@/pages/notFound'
import { checkIsNotFoundError } from '@/shared/api'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'
import { LoadingScreen } from '@/shared/components/loadingScreen'
import { useAuthStatus } from '@/shared/hooks'

const TODAY_RESTAURANT_MENU_PAGE_SIZE = 10

export const TodayRestaurantPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStatus()
  const { startKakaoOAuth } = useKakaoOAuthStart()
  const initialTab = getRestaurantDetailTabState(location.state).activeTab
  const [recommendedSummary, setRecommendedSummary] =
    useState<RestaurantSummary | null>(null)
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false)
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)

  const randomRecommendationQuery = useQuery(
    randomRestaurantRecommendationQueryOptions(),
  )
  const summary = recommendedSummary ?? randomRecommendationQuery.data
  const restaurantId = summary?.restaurantId ?? 0
  const hasRestaurantId = restaurantId > 0
  const detailContent = useRestaurantDetailContent({
    enabled: hasRestaurantId,
    initialTab: initialTab ?? undefined,
    menuPageSize: TODAY_RESTAURANT_MENU_PAGE_SIZE,
    restaurantId,
    summary,
  })
  const recommendAgainMutation = useMutation({
    mutationFn: ({ excludeRestaurantId }: { excludeRestaurantId?: number }) =>
      getRandomRestaurantRecommendation(
        excludeRestaurantId === undefined ? undefined : { excludeRestaurantId },
      ),
    onSuccess: (nextSummary) => {
      setRecommendedSummary(nextSummary)
      detailContent.resetDetailState()
    },
  })
  const requestError =
    randomRecommendationQuery.error ??
    recommendAgainMutation.error ??
    detailContent.error

  if (requestError) {
    if (checkIsNotFoundError(requestError)) {
      return <NotFoundPage />
    }

    throw requestError
  }

  if (
    randomRecommendationQuery.isPending ||
    !summary ||
    detailContent.isLoading ||
    !detailContent.restaurant
  ) {
    return <LoadingScreen />
  }

  const { restaurant } = detailContent

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

  return (
    <>
      <RestaurantDetailTemplate
        activeTab={detailContent.activeTab}
        hasMoreMenus={detailContent.hasMoreMenus}
        hasMoreReviews={detailContent.hasMoreReviews}
        isMenuListError={detailContent.isMenuListError}
        isReviewImageViewerOpen={detailContent.isReviewImageViewerOpen}
        isReviewListError={detailContent.isReviewListError}
        isReviewListLoading={detailContent.isReviewListLoading}
        isReviewUnavailableModalOpen={
          detailContent.isReviewUnavailableModalOpen
        }
        menuLoadMoreRef={detailContent.menuLoadMoreRef}
        onCloseReviewImageViewer={detailContent.onCloseReviewImageViewer}
        onCloseReviewUnavailableModal={
          detailContent.onCloseReviewUnavailableModal
        }
        onPressBack={handlePressBack}
        onPressLike={handlePressLike}
        onPressMenuItem={handlePressMenuItem}
        onPressRecommendAgain={handlePressRecommendAgain}
        onPressReservation={handlePressReservation}
        onPressReviewImage={detailContent.onPressReviewImage}
        onPressWriteReview={detailContent.onPressWriteReview}
        onRetryMenuList={detailContent.onRetryMenuList}
        onRetryReviewList={detailContent.onRetryReviewList}
        onSelectReviewSort={detailContent.onSelectReviewSort}
        onTabChange={detailContent.onTabChange}
        restaurant={restaurant}
        reviewImageViewerImageUrls={detailContent.reviewImageViewerImageUrls}
        reviewImageViewerInitialIndex={
          detailContent.reviewImageViewerInitialIndex
        }
        reviewLoadMoreRef={detailContent.reviewLoadMoreRef}
        selectedReviewSort={detailContent.selectedReviewSort}
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
