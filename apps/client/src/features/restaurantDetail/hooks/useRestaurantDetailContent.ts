import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { showToast } from '@hashi/hds-ui'
import {
  saveRecentRestaurant,
  removeRecentRestaurants,
} from '@/features/recentRestaurants/recentRestaurants'
import { checkIsNotFoundError } from '@/shared/api'

import type { RestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import { useRestaurantDetailListQueries } from '@/features/restaurantDetail/hooks/useRestaurantDetailListQueries'
import {
  restaurantStoreInformationQueryOptions,
  restaurantReviewsInfiniteQueryOptions,
} from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import { restaurantDetailQueryKeys } from '@/features/restaurantDetail/queries/restaurantDetailQueryKeys'
import {
  REVIEW_PAGE_SIZE,
  type ReviewSortValue,
} from '@/features/restaurantDetail/constants/restaurantReview'
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
  const client = useQueryClient()
  const sortRequest = useRef(0)
  const [isSortPending, setIsSortPending] = useState(false)
  useEffect(
    () => () => {
      sortRequest.current += 1
    },
    [restaurantId],
  )
  const resetTabList = useCallback(
    (tab: RestaurantDetailTab) => {
      const queryKey =
        tab === 'menu'
          ? restaurantDetailQueryKeys.menus(restaurantId, menuPageSize)
          : tab === 'review'
            ? restaurantDetailQueryKeys.reviews(
                restaurantId,
                REVIEW_PAGE_SIZE,
                'latest',
              )
            : undefined
      if (queryKey && client.getQueryData(queryKey)) {
        void client.resetQueries({ queryKey, exact: true })
      }
    },
    [client, restaurantId, menuPageSize],
  )

  useEffect(() => {
    if (enabled && initialTab) resetTabList(initialTab)
  }, [enabled, initialTab, resetTabList])

  const storeInformationQuery = useQuery({
    ...restaurantStoreInformationQueryOptions(restaurantId),
    enabled,
  })
  const infiniteLists = useRestaurantDetailListQueries({
    activeTab,
    enabled,
    menuPageSize,
    restaurantId,
    selectedReviewSort,
  })

  const storeInformation = storeInformationQuery.data
  const recordedId = useRef<number | null>(null)
  useEffect(() => {
    if (checkIsNotFoundError(storeInformationQuery.error)) {
      removeRecentRestaurants([restaurantId])
      return
    }
    if (
      enabled &&
      summary?.restaurantId === restaurantId &&
      storeInformation &&
      !storeInformationQuery.error &&
      !infiniteLists.isMenuListPending &&
      recordedId.current !== restaurantId
    ) {
      saveRecentRestaurant({ id: restaurantId, name: summary.name })
      recordedId.current = restaurantId
    }
  }, [
    enabled,
    summary,
    storeInformation,
    storeInformationQuery.error,
    infiniteLists.isMenuListPending,
    restaurantId,
  ])
  const restaurant =
    summary && storeInformation
      ? createRestaurantDetailViewModel({
          summary,
          storeInformation,
          menus: infiniteLists.menus,
          reviews: infiniteLists.reviews,
          averageRating: infiniteLists.firstReviewPage?.averageRating,
          reviewCount: infiniteLists.firstReviewPage?.reviewCount,
          ratingDistribution: infiniteLists.firstReviewPage?.ratingDistribution,
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

  const resetDetailState = (tab: RestaurantDetailTab = 'info') => {
    sortRequest.current += 1
    setIsSortPending(false)
    setActiveTab(tab)
    setSelectedReviewSort('latest')
    setIsReviewImageViewerOpen(false)
    setReviewImageViewerImageUrls([])
    setReviewImageViewerInitialIndex(0)
    setIsReviewUnavailableModalOpen(false)
  }

  const handleTabChange = (tab: RestaurantDetailTab) => {
    if (tab === activeTab) return
    sortRequest.current += 1
    setIsSortPending(false)
    resetTabList(tab)
    if (tab === 'review') {
      setSelectedReviewSort('latest')
    }
    setActiveTab(tab)
  }

  const handleSelectReviewSort = async (sort: ReviewSortValue) => {
    if (sort === selectedReviewSort || isSortPending) return
    const request = ++sortRequest.current
    setIsSortPending(true)
    try {
      await client.fetchInfiniteQuery({
        ...restaurantReviewsInfiniteQueryOptions({
          restaurantId,
          size: REVIEW_PAGE_SIZE,
          sort,
        }),
        staleTime: 0,
        pages: 1,
      })
      if (request === sortRequest.current) setSelectedReviewSort(sort)
    } catch {
      if (request === sortRequest.current)
        showToast({ children: '리뷰를 불러오지 못했어요.' })
    } finally {
      if (request === sortRequest.current) setIsSortPending(false)
    }
  }

  return {
    activeTab,
    error: storeInformationQuery.error,
    hasMoreMenus: infiniteLists.hasMoreMenus,
    hasMoreReviews: infiniteLists.hasMoreReviews,
    isLoading: enabled && (!summary || !storeInformation),
    isMenuListError: infiniteLists.isMenuListError,
    isMenuListLoading: infiniteLists.isMenuListPending,
    isMenuNextPageError: infiniteLists.isMenuNextPageError,
    isReviewNextPageError: infiniteLists.isReviewNextPageError,
    isReviewImageViewerOpen,
    isReviewListError: infiniteLists.isReviewListError,
    isReviewListLoading: infiniteLists.isReviewListLoading || isSortPending,
    isReviewUnavailableModalOpen,
    menuLoadMoreRef: infiniteLists.menuLoadMoreRef,
    onCloseReviewImageViewer: () => setIsReviewImageViewerOpen(false),
    onCloseReviewUnavailableModal: () => setIsReviewUnavailableModalOpen(false),
    onOpenReviewUnavailableModal: () => setIsReviewUnavailableModalOpen(true),
    onPressReviewImage: handlePressReviewImage,
    onRetryMenuList: infiniteLists.onRetryMenuList,
    onRetryReviewList: infiniteLists.onRetryReviewList,
    onSelectReviewSort: handleSelectReviewSort,
    onTabChange: handleTabChange,
    resetDetailState,
    restaurant,
    reviewImageViewerImageUrls,
    reviewImageViewerInitialIndex,
    reviewLoadMoreRef: infiniteLists.reviewLoadMoreRef,
    selectedReviewSort,
  }
}
