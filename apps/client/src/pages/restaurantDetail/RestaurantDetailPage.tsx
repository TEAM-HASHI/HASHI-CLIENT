import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  MOCK_RESTAURANT_DETAIL,
  RestaurantDetailTemplate,
  type RestaurantDetailTab,
} from '@/features/restaurantDetail'

const getRestaurantMenuDetailPath = (restaurantId: string, menuId: string) =>
  ROUTES.restaurantMenuDetail
    .replace(':restaurantId', restaurantId)
    .replace(':menuId', menuId)

export const RestaurantDetailPage = () => {
  const navigate = useNavigate()
  const { restaurantId } = useParams()
  const [activeTab, setActiveTab] = useState<RestaurantDetailTab>('info')
  const [isReviewImageViewerOpen, setIsReviewImageViewerOpen] = useState(false)
  const [isReviewUnavailableModalOpen, setIsReviewUnavailableModalOpen] =
    useState(false)

  const restaurant = {
    ...MOCK_RESTAURANT_DETAIL,
    id: restaurantId ?? MOCK_RESTAURANT_DETAIL.id,
  }

  const handlePressBack = () => {
    navigate(-1)
  }

  const handlePressLike = () => {
    // TODO: 에러컴포넌트 머지 시, 에러페이지로 이동
  }

  const handlePressReservation = () => {
    // TODO: 예약 페이지 route 확정 후 이동 처리
  }

  const handlePressMenuItem = (menuId: string) => {
    navigate(getRestaurantMenuDetailPath(restaurant.id, menuId))
  }

  const handlePressReviewImage = () => {
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
      title="식당 상세 정보"
      variant="detail"
    />
  )
}
