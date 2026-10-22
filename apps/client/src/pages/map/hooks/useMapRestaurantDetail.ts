import { showToast } from '@hashi/hds-ui'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

import type { ReviewSortValue } from '@/features/restaurantDetail/constants/restaurantReview'
import { useRestaurantDetailListQueries } from '@/features/restaurantDetail/hooks/useRestaurantDetailListQueries'
import { useRestaurantPhotos } from '@/features/restaurantDetail/hooks/useRestaurantPhotos'
import {
  restaurantReviewsInfiniteQueryOptions,
  restaurantStoreInformationQueryOptions,
  restaurantSummaryQueryOptions,
} from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'
import { restaurantDetailQueryKeys } from '@/features/restaurantDetail/queries/restaurantDetailQueryKeys'
import { createRestaurantDetailViewModel } from '@/features/restaurantDetail/utils/createRestaurantDetailViewModel'
import type { MapPanelStage, MapRestaurant } from '@/pages/map/types'

interface UseMapRestaurantDetailParams {
  restaurant: MapRestaurant
  stage: MapPanelStage
  onLoadError?: () => void
  initialTab?: RestaurantDetailTab
  onTabChange?: (tab: RestaurantDetailTab) => void
}
const MAP_REVIEW_PAGE_SIZE = 5

export const useMapRestaurantDetail = ({
  restaurant,
  stage,
  onLoadError,
  initialTab = 'info',
  onTabChange,
}: UseMapRestaurantDetailParams) => {
  const [activeTab, setActiveTab] = useState<RestaurantDetailTab>(initialTab)
  const restaurantId = Number(restaurant.id)
  const hasValidId = Number.isSafeInteger(restaurantId) && restaurantId > 0
  const summaryQuery = useQuery({
    ...restaurantSummaryQueryOptions(restaurantId),
    enabled: hasValidId,
  })
  const isExpanded = stage === 'expanded'
  const photos = useRestaurantPhotos(
    hasValidId ? restaurantId : 0,
    isExpanded && activeTab === 'photo',
  )
  const isStoreInformationEnabled =
    hasValidId && isExpanded && activeTab === 'info' && !!summaryQuery.data
  const storeInformationQuery = useQuery({
    ...restaurantStoreInformationQueryOptions(restaurantId),
    enabled: isStoreInformationEnabled,
  })
  const [selectedReviewSort, setSelectedReviewSort] =
    useState<ReviewSortValue>('latest')
  const [isSortPending, setIsSortPending] = useState(false)
  const sortRequest = useRef(0)
  const client = useQueryClient()
  const [isReviewEntryReady, setIsReviewEntryReady] = useState(
    initialTab !== 'review',
  )
  useEffect(() => {
    if (isReviewEntryReady) return
    // Menu-detail returns mount directly into this tab. Clear old pages before
    // enabling its query, just as an in-place review-tab click does.
    void client.resetQueries({
      queryKey: restaurantDetailQueryKeys.reviews(
        restaurantId,
        MAP_REVIEW_PAGE_SIZE,
        'latest',
      ),
      exact: true,
    })
    setIsReviewEntryReady(true)
  }, [client, restaurantId, isReviewEntryReady])
  useEffect(
    () => () => {
      sortRequest.current += 1
    },
    [restaurantId],
  )

  const lists = useRestaurantDetailListQueries({
    activeTab,
    enabled:
      hasValidId && isExpanded && !!summaryQuery.data && isReviewEntryReady,
    menuPageSize: 10,
    reviewPageSize: MAP_REVIEW_PAGE_SIZE,
    restaurantId,
    selectedReviewSort,
  })
  const summary = summaryQuery.data
  // The placeholder only lets independent menu/review models be composed before
  // the info tab is requested; store information is never rendered from it.
  const detail = summary
    ? createRestaurantDetailViewModel({
        summary,
        storeInformation: storeInformationQuery.data ?? {
          restaurantId,
          businessHours: [],
        },
        menus: lists.menus,
        reviews: lists.reviews,
        averageRating: lists.firstReviewPage?.averageRating,
        reviewCount: lists.firstReviewPage?.reviewCount,
        ratingDistribution: lists.firstReviewPage?.ratingDistribution,
      })
    : null
  const displayRestaurant: MapRestaurant =
    summary && detail
      ? {
          ...restaurant,
          name: summary.name,
          cuisine: summary.foodCategory ?? restaurant.cuisine,
          rating: detail.rating,
          reviewCount: detail.reviewCount,
          description: summary.summary ?? '',
          address: summary.address,
          images: detail.heroImages
            .filter((image): image is string => !!image)
            .slice(0, 10),
          ...(storeInformationQuery.data
            ? { hours: detail.businessHoursSummary, price: detail.priceRange }
            : {}),
        }
      : restaurant
  const hasLoadError =
    !hasValidId ||
    (summaryQuery.isError && summaryQuery.fetchStatus === 'idle') ||
    (isStoreInformationEnabled &&
      storeInformationQuery.isError &&
      storeInformationQuery.fetchStatus === 'idle')
  const reportedError = useRef(false)
  useEffect(() => {
    if (!hasLoadError || reportedError.current) return
    reportedError.current = true
    onLoadError?.()
  }, [hasLoadError, onLoadError])

  const handleSelectReviewSort = async (sort: ReviewSortValue) => {
    if (sort === selectedReviewSort || isSortPending) return
    const request = ++sortRequest.current
    setIsSortPending(true)
    try {
      await client.fetchInfiniteQuery({
        ...restaurantReviewsInfiniteQueryOptions({
          restaurantId,
          size: MAP_REVIEW_PAGE_SIZE,
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

  const handleTabChange = (tab: RestaurantDetailTab) => {
    if (activeTab === tab) return
    sortRequest.current += 1
    setIsSortPending(false)
    if (tab === 'review') {
      const queryKey = restaurantDetailQueryKeys.reviews(
        restaurantId,
        MAP_REVIEW_PAGE_SIZE,
        'latest',
      )
      void client.resetQueries({ queryKey, exact: true })
      setSelectedReviewSort('latest')
    }
    setActiveTab(tab)
    onTabChange?.(tab)
  }

  return {
    ...lists,
    photos,
    activeTab,
    detail,
    displayRestaurant,
    hasLoadError,
    isSummaryLoading:
      hasValidId &&
      (summaryQuery.isPending ||
        (summaryQuery.isError && summaryQuery.fetchStatus !== 'idle')),
    isStoreInformationLoading:
      isStoreInformationEnabled &&
      (storeInformationQuery.isPending ||
        (storeInformationQuery.isError &&
          storeInformationQuery.fetchStatus !== 'idle')),
    isReviewListLoading:
      lists.isReviewListLoading || isSortPending || !isReviewEntryReady,
    selectedReviewSort,
    onSelectReviewSort: handleSelectReviewSort,
    onTabChange: handleTabChange,
    onRetry: () => {
      reportedError.current = false
      if (summaryQuery.isError) return summaryQuery.refetch()
      return storeInformationQuery.refetch()
    },
  }
}
