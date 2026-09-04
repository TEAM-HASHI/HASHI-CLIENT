import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getRestaurantDetailPath } from '@/app/router/routePaths'
import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import { RestaurantDetailTemplate } from '@/features/restaurantDetail'
import { useRestaurantDetailActions } from '@/features/restaurantDetail/hooks/useRestaurantDetailActions'
import { useRestaurantDetailContent } from '@/features/restaurantDetail/hooks/useRestaurantDetailContent'
import { useRestaurantReviewWriteNavigation } from '@/features/restaurantDetail/hooks/useRestaurantReviewWriteNavigation'
import { restaurantSummaryQueryOptions } from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import {
  getRestaurantDetailTabState,
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
  const initialTab = getRestaurantDetailTabState(location.state).activeTab

  const summaryQuery = useQuery(restaurantSummaryQueryOptions(restaurantId))
  const detailContent = useRestaurantDetailContent({
    initialTab: initialTab ?? undefined,
    menuPageSize: RESTAURANT_DETAIL_MENU_PAGE_SIZE,
    restaurantId,
    summary: summaryQuery.data,
  })
  const detailActions = useRestaurantDetailActions({
    menuDetailSource: 'detail',
    restaurantId: String(restaurantId),
  })
  const reviewWriteNavigation = useRestaurantReviewWriteNavigation({
    isAuthenticated,
    onAuthRequired: () => detailActions.onAuthGateOpenChange(true),
    onReviewUnavailable: detailContent.onOpenReviewUnavailableModal,
    restaurantId,
  })

  const requestError =
    summaryQuery.error ?? detailContent.error ?? reviewWriteNavigation.error

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
        onPressLike={detailActions.onPressLike}
        onPressMenuItem={detailActions.onPressMenuItem}
        onPressReservation={detailActions.onPressReservation}
        onPressReviewImage={detailContent.onPressReviewImage}
        onPressWriteReview={reviewWriteNavigation.onPressWriteReview}
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
        shouldScrollToInitialTab={
          initialTab === 'menu' || initialTab === 'review'
        }
        title="식당 상세 정보"
        variant="detail"
      />
      <AuthGateBottomSheet
        onKakaoPress={detailActions.onPressKakao}
        onOpenChange={detailActions.onAuthGateOpenChange}
        open={detailActions.isAuthGateOpen}
      />
      <ComingSoonDialog
        onOpenChange={detailActions.onComingSoonOpenChange}
        open={detailActions.isComingSoonOpen}
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
