import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import {
  MOCK_RESTAURANT_DETAIL,
  RestaurantDetailTemplate,
  type RestaurantDetailTab,
} from '@/features/restaurantDetail'
import {
  getRestaurantDetailPath,
  getRestaurantDetailTabState,
  getRestaurantMenuDetailPath,
  getRestaurantReservationNewPath,
  navigateBackOrReplace,
} from '@/features/restaurantDetail/utils/restaurantDetailRoutes'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'
import { useAuthStatus } from '@/shared/hooks'

export const RestaurantDetailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { restaurantId } = useParams()
  const { isAuthenticated } = useAuthStatus()
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

  const restaurant = {
    ...MOCK_RESTAURANT_DETAIL,
    id: restaurantId ?? MOCK_RESTAURANT_DETAIL.id,
  }

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
        onPressReservation={handlePressReservation}
        onPressReviewImage={handlePressReviewImage}
        onPressWriteReview={handlePressWriteReview}
        onTabChange={setActiveTab}
        restaurant={restaurant}
        reviewImageViewerImageUrls={reviewImageViewerImageUrls}
        reviewImageViewerInitialIndex={reviewImageViewerInitialIndex}
        shareUrl={getRestaurantDetailPath(restaurant.id)}
        title="식당 상세 정보"
        variant="detail"
      />
      <AuthGateBottomSheet
        onKakaoPress={() => undefined}
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
