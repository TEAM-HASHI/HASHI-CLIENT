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

interface UseRestaurantDetailListQueriesParams {
  activeTab: RestaurantDetailTab
  enabled: boolean
  menuPageSize: number
  restaurantId: number
  selectedReviewSort: ReviewSortValue
}

export const useRestaurantDetailListQueries = ({
  activeTab,
  enabled,
  menuPageSize,
  restaurantId,
  selectedReviewSort,
}: UseRestaurantDetailListQueriesParams) => {
  const menusQuery = useInfiniteQuery({
    ...restaurantMenusInfiniteQueryOptions(restaurantId, menuPageSize),
    enabled: enabled && activeTab === 'menu',
  })
  const reviewsQuery = useInfiniteQuery({
    ...restaurantReviewsInfiniteQueryOptions({
      restaurantId,
      size: REVIEW_PAGE_SIZE,
      sort: selectedReviewSort,
    }),
    enabled: enabled && activeTab === 'review',
  })

  const canFetchNextMenuPage =
    enabled &&
    menusQuery.hasNextPage &&
    !menusQuery.isFetching &&
    !menusQuery.isError
  const canFetchNextReviewPage =
    enabled &&
    reviewsQuery.hasNextPage &&
    !reviewsQuery.isFetching &&
    !reviewsQuery.isError
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
  const menus = [
    ...new Map(
      menuPages
        .flatMap((page: RestaurantMenuListData) => page.menus)
        .map((menu) => [menu.menuId, menu]),
    ).values(),
  ]
  const reviews = [
    ...new Map(
      reviewPages
        .flatMap((page: RestaurantReviewListData) => page.reviews)
        .map((review) => [review.reviewId, review]),
    ).values(),
  ]

  return {
    firstReviewPage: reviewPages[0],
    hasMoreMenus: menusQuery.hasNextPage,
    hasMoreReviews: reviewsQuery.hasNextPage,
    isMenuListError: menusQuery.isError && menuPages.length === 0,
    isMenuListPending: activeTab === 'menu' && menusQuery.isPending,
    isMenuNextPageError: menusQuery.isFetchNextPageError,
    isReviewNextPageError: reviewsQuery.isFetchNextPageError,
    isReviewListError: reviewsQuery.isError && reviewPages.length === 0,
    isReviewListLoading: reviewsQuery.isPending,
    menuLoadMoreRef,
    menus,
    onRetryMenuList: () =>
      menusQuery.isFetchNextPageError
        ? menusQuery.fetchNextPage()
        : menusQuery.refetch(),
    onRetryReviewList: () =>
      reviewsQuery.isFetchNextPageError
        ? reviewsQuery.fetchNextPage()
        : reviewsQuery.refetch(),
    reviewLoadMoreRef,
    reviews,
  }
}
