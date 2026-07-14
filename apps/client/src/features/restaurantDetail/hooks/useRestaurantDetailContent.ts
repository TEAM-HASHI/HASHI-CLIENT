import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import type { RestaurantMenuListData } from '@/features/restaurantDetail/api/getRestaurantMenus'
import type { RestaurantReviewListData } from '@/features/restaurantDetail/api/getRestaurantReviews'
import type { RestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import {
  REVIEW_PAGE_SIZE,
  type ReviewSortValue,
} from '@/features/restaurantDetail/constants/restaurantReview'
import {
  restaurantMenusInfiniteQueryOptions,
  restaurantReviewsInfiniteQueryOptions,
  restaurantStoreInformationQueryOptions,
} from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'
import { createRestaurantDetailViewModel } from '@/features/restaurantDetail/utils/createRestaurantDetailViewModel'
import { useInfiniteScrollTrigger } from '@/shared/hooks'

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

  const storeInformationQuery = useQuery({
    ...restaurantStoreInformationQueryOptions(restaurantId),
    enabled,
  })
  const menusQuery = useInfiniteQuery({
    ...restaurantMenusInfiniteQueryOptions(restaurantId, menuPageSize),
    enabled,
  })
  const reviewsQuery = useInfiniteQuery({
    ...restaurantReviewsInfiniteQueryOptions({
      restaurantId,
      size: REVIEW_PAGE_SIZE,
      sort: selectedReviewSort,
    }),
    enabled,
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

  const storeInformation = storeInformationQuery.data
  const menuPages = menusQuery.data?.pages ?? []
  const reviewPages = reviewsQuery.data?.pages ?? []
  const menus = menuPages.flatMap((page: RestaurantMenuListData) => page.menus)
  const reviews = reviewPages.flatMap(
    (page: RestaurantReviewListData) => page.reviews,
  )
  const firstReviewPage = reviewPages[0]
  const restaurant =
    summary && storeInformation
      ? createRestaurantDetailViewModel({
          summary,
          storeInformation,
          menus,
          reviews,
          averageRating: firstReviewPage?.averageRating,
          reviewCount: firstReviewPage?.reviewCount,
          ratingDistribution: firstReviewPage?.ratingDistribution,
        })
      : null

  const handlePressReviewImage = (reviewId: string, imageIndex: number) => {
    const selectedReview = restaurant?.reviews.find(
      (review) => review.id === reviewId,
    )

    setReviewImageViewerImageUrls(selectedReview?.images ?? [])
    setReviewImageViewerInitialIndex(imageIndex)
    setIsReviewImageViewerOpen(true)
  }

  const handleCloseReviewImageViewer = () => {
    setIsReviewImageViewerOpen(false)
  }

  const handleOpenReviewUnavailableModal = () => {
    setIsReviewUnavailableModalOpen(true)
  }

  const handleCloseReviewUnavailableModal = () => {
    setIsReviewUnavailableModalOpen(false)
  }

  const resetDetailState = () => {
    setActiveTab('info')
    setSelectedReviewSort('latest')
    setIsReviewImageViewerOpen(false)
    setIsReviewUnavailableModalOpen(false)
    setReviewImageViewerImageUrls([])
    setReviewImageViewerInitialIndex(0)
  }

  return {
    activeTab,
    error: storeInformationQuery.error,
    hasMoreMenus: menusQuery.hasNextPage,
    hasMoreReviews: reviewsQuery.hasNextPage,
    isLoading:
      enabled && (!summary || !storeInformation || menusQuery.isPending),
    isMenuListError: menusQuery.isError && menuPages.length === 0,
    isReviewImageViewerOpen,
    isReviewListError: reviewsQuery.isError && reviewPages.length === 0,
    isReviewListLoading: reviewsQuery.isPending,
    isReviewUnavailableModalOpen,
    menuLoadMoreRef,
    onCloseReviewImageViewer: handleCloseReviewImageViewer,
    onCloseReviewUnavailableModal: handleCloseReviewUnavailableModal,
    onOpenReviewUnavailableModal: handleOpenReviewUnavailableModal,
    onPressReviewImage: handlePressReviewImage,
    onRetryMenuList: () => void menusQuery.refetch(),
    onRetryReviewList: () => void reviewsQuery.refetch(),
    onSelectReviewSort: setSelectedReviewSort,
    onTabChange: setActiveTab,
    resetDetailState,
    restaurant,
    reviewImageViewerImageUrls,
    reviewImageViewerInitialIndex,
    reviewLoadMoreRef,
    selectedReviewSort,
  }
}
