import { useQuery } from '@tanstack/react-query'

import type { RestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import { useRestaurantDetailInfiniteLists } from '@/features/restaurantDetail/hooks/useRestaurantDetailInfiniteLists'
import { useRestaurantDetailReviewImageViewer } from '@/features/restaurantDetail/hooks/useRestaurantDetailReviewImageViewer'
import { useRestaurantDetailReviewUnavailableModal } from '@/features/restaurantDetail/hooks/useRestaurantDetailReviewUnavailableModal'
import { useRestaurantDetailTabs } from '@/features/restaurantDetail/hooks/useRestaurantDetailTabs'
import { restaurantStoreInformationQueryOptions } from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'
import { createRestaurantDetailViewModel } from '@/features/restaurantDetail/utils/createRestaurantDetailViewModel'

interface UseRestaurantDetailContentParams {
  enabled?: boolean
  initialTab?: RestaurantDetailTab
  menuPageSize: number
  restaurantId: number
  summary: RestaurantSummary | undefined
}

export const useRestaurantDetailContent = ({
  enabled = true,
  initialTab,
  menuPageSize,
  restaurantId,
  summary,
}: UseRestaurantDetailContentParams) => {
  const detailTabs = useRestaurantDetailTabs({ initialTab })
  const reviewImageViewer = useRestaurantDetailReviewImageViewer()
  const reviewUnavailableModal = useRestaurantDetailReviewUnavailableModal()

  const storeInformationQuery = useQuery({
    ...restaurantStoreInformationQueryOptions(restaurantId),
    enabled,
  })
  const infiniteLists = useRestaurantDetailInfiniteLists({
    activeTab: detailTabs.activeTab,
    enabled,
    menuPageSize,
    restaurantId,
    selectedReviewSort: detailTabs.selectedReviewSort,
  })

  const storeInformation = storeInformationQuery.data
  const restaurant =
    summary && storeInformation
      ? createRestaurantDetailViewModel({
          summary,
          storeInformation,
          menus: infiniteLists.menus,
          reviews: infiniteLists.reviews,
          averageRating: infiniteLists.firstReviewPage?.averageRating ?? 0,
          reviewCount: infiniteLists.firstReviewPage?.reviewCount ?? 0,
          ratingDistribution: infiniteLists.firstReviewPage?.ratingDistribution,
        })
      : null

  const handlePressReviewImage = (reviewId: string, imageIndex: number) => {
    reviewImageViewer.onOpenReviewImageViewer({
      imageIndex,
      restaurant,
      reviewId,
    })
  }

  const resetDetailState = () => {
    detailTabs.resetTabs()
    reviewImageViewer.resetReviewImageViewer()
    reviewUnavailableModal.resetReviewUnavailableModal()
  }

  return {
    activeTab: detailTabs.activeTab,
    error: storeInformationQuery.error,
    hasMoreMenus: infiniteLists.hasMoreMenus,
    hasMoreReviews: infiniteLists.hasMoreReviews,
    isLoading:
      enabled &&
      (!summary || !storeInformation || infiniteLists.isMenuListPending),
    isMenuListError: infiniteLists.isMenuListError,
    isReviewImageViewerOpen: reviewImageViewer.isReviewImageViewerOpen,
    isReviewListError: infiniteLists.isReviewListError,
    isReviewListLoading: infiniteLists.isReviewListLoading,
    isReviewUnavailableModalOpen:
      reviewUnavailableModal.isReviewUnavailableModalOpen,
    menuLoadMoreRef: infiniteLists.menuLoadMoreRef,
    onCloseReviewImageViewer: reviewImageViewer.onCloseReviewImageViewer,
    onCloseReviewUnavailableModal:
      reviewUnavailableModal.onCloseReviewUnavailableModal,
    onOpenReviewUnavailableModal:
      reviewUnavailableModal.onOpenReviewUnavailableModal,
    onPressReviewImage: handlePressReviewImage,
    onRetryMenuList: infiniteLists.onRetryMenuList,
    onRetryReviewList: infiniteLists.onRetryReviewList,
    onSelectReviewSort: detailTabs.onSelectReviewSort,
    onTabChange: detailTabs.onTabChange,
    resetDetailState,
    restaurant,
    reviewImageViewerImageUrls: reviewImageViewer.reviewImageViewerImageUrls,
    reviewImageViewerInitialIndex:
      reviewImageViewer.reviewImageViewerInitialIndex,
    reviewLoadMoreRef: infiniteLists.reviewLoadMoreRef,
    selectedReviewSort: detailTabs.selectedReviewSort,
  }
}
