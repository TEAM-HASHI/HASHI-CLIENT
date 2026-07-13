import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'
import { getPathFromLocation } from '@/features/auth/utils/authRedirect'
import {
  MOCK_RESTAURANT_DETAIL,
  RestaurantDetailTemplate,
  type RestaurantDetailTab,
} from '@/features/restaurantDetail'
import {
  getRestaurantDetailTabState,
  getRestaurantMenuDetailPath,
  getRestaurantReservationNewPath,
  navigateBackOrReplace,
} from '@/features/restaurantDetail/utils/restaurantDetailRoutes'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'
import { useAuthStatus } from '@/shared/hooks'

export const TodayRestaurantPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStatus()
  const { startKakaoOAuth } = useKakaoOAuthStart()
  const initialTab = getRestaurantDetailTabState(location.state).activeTab
  const [activeTab, setActiveTab] = useState<RestaurantDetailTab>(
    initialTab ?? 'info',
  )
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

    navigate(getRestaurantReservationNewPath(MOCK_RESTAURANT_DETAIL.id))
  }

  const handlePressRecommendAgain = () => {
    // TODO: 오늘의 식당 다시 추천 API 연결
  }

  const handlePressMenuItem = (menuId: string) => {
    navigate(getRestaurantMenuDetailPath(MOCK_RESTAURANT_DETAIL.id, menuId), {
      state: { source: 'today' },
    })
  }

  const handlePressReviewImage = (reviewId: string, imageIndex: number) => {
    const selectedReview = MOCK_RESTAURANT_DETAIL.reviews.find(
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

  return (
    <>
      <RestaurantDetailTemplate
        activeTab={activeTab}
        isReviewImageViewerOpen={isReviewImageViewerOpen}
        isReviewUnavailableModalOpen={isReviewUnavailableModalOpen}
        onCloseReviewImageViewer={handleCloseReviewImageViewer}
        onCloseReviewUnavailableModal={handleCloseReviewUnavailableModal}
        onPressBack={handlePressBack}
        onPressLike={handlePressLike}
        onPressMenuItem={handlePressMenuItem}
        onPressRecommendAgain={handlePressRecommendAgain}
        onPressReservation={handlePressReservation}
        onPressReviewImage={handlePressReviewImage}
        onPressWriteReview={handlePressWriteReview}
        onTabChange={setActiveTab}
        restaurant={MOCK_RESTAURANT_DETAIL}
        reviewImageViewerImageUrls={reviewImageViewerImageUrls}
        reviewImageViewerInitialIndex={reviewImageViewerInitialIndex}
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
