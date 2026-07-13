import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'
import { getPathFromLocation } from '@/features/auth/utils/authRedirect'
import { RestaurantDetailTemplate } from '@/features/restaurantDetail'
import { useRestaurantDetailContent } from '@/features/restaurantDetail/hooks/useRestaurantDetailContent'
import { restaurantSummaryQueryOptions } from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import {
  getRestaurantDetailPath,
  getRestaurantDetailTabState,
  getRestaurantMenuDetailPath,
  getRestaurantReservationNewPath,
  navigateBackOrReplace,
} from '@/features/restaurantDetail/utils/restaurantDetailRoutes'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'
import { LoadingScreen } from '@/shared/components/loadingScreen'
import { checkIsNotFoundError } from '@/shared/api'
import { useAuthStatus } from '@/shared/hooks'
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
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false)
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)

  const summaryQuery = useQuery(restaurantSummaryQueryOptions(restaurantId))
  const detailContent = useRestaurantDetailContent({
    initialTab: initialTab ?? undefined,
    menuPageSize: RESTAURANT_DETAIL_MENU_PAGE_SIZE,
    restaurantId,
    summary: summaryQuery.data,
  })

  const requestError = summaryQuery.error ?? detailContent.error

  if (requestError) {
    if (checkIsNotFoundError(requestError)) {
      return <NotFoundPage />
    }

    throw requestError
  }

  if (detailContent.isLoading || !detailContent.restaurant) {
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

  const handlePressMenuItem = (menuId: string) => {
    navigate(getRestaurantMenuDetailPath(restaurant.id, menuId), {
      state: { source: 'detail' },
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
