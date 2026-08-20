import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import type { RestaurantMenuListData } from '@/features/restaurantDetail/api/getRestaurantMenus'
import type { RestaurantReviewListData } from '@/features/restaurantDetail/api/getRestaurantReviews'
import {
  REVIEW_PAGE_SIZE,
  type ReviewSortValue,
} from '@/features/restaurantDetail/constants/restaurantReview'
import {
  restaurantMenusInfiniteQueryOptions,
  restaurantReviewsInfiniteQueryOptions,
} from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'
import { useInfiniteScrollTrigger } from '@/shared/hooks'

interface UseRestaurantDetailInfiniteListsParams {
  activeTab: RestaurantDetailTab
  enabled: boolean
  menuPageSize: number
  restaurantId: number
  selectedReviewSort: ReviewSortValue
}

export const useRestaurantDetailInfiniteLists = ({
  activeTab,
  enabled,
  menuPageSize,
  restaurantId,
  selectedReviewSort,
}: UseRestaurantDetailInfiniteListsParams) => {
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

  const menuPages = menusQuery.data?.pages ?? []
  const reviewPages = reviewsQuery.data?.pages ?? []
  const menus = menuPages.flatMap((page: RestaurantMenuListData) => page.menus)
  const reviews = reviewPages.flatMap(
    (page: RestaurantReviewListData) => page.reviews,
  )

  return {
    firstReviewPage: reviewPages[0],
    hasMoreMenus: menusQuery.hasNextPage,
    hasMoreReviews: reviewsQuery.hasNextPage,
    isMenuListError: menusQuery.isError && menuPages.length === 0,
    isMenuListPending: menusQuery.isPending,
    isReviewListError: reviewsQuery.isError && reviewPages.length === 0,
    isReviewListLoading: reviewsQuery.isPending,
    menuLoadMoreRef,
    menus,
    onRetryMenuList: () => void menusQuery.refetch(),
    onRetryReviewList: () => void reviewsQuery.refetch(),
    reviewLoadMoreRef,
    reviews,
  }
}
