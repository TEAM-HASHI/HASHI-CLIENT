import { useMemo, useRef, useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { useDeleteReviewMutation } from '@/features/review/mutations/useDeleteReviewMutation'
import { useMyReviewCountQuery } from '@/features/review/queries/useMyReviewCountQuery'
import { useVisitedReservationsInfiniteQuery } from '@/features/review/queries/visitedReservations'
import {
  MY_REVIEW_TAB_ITEMS,
  type MyReviewTabTypes,
} from '@/pages/myReviews/constants/myReviewTabs'
import { useMyReviewsInfiniteQuery } from '@/pages/myReviews/queries/myReviewsQueries'
import {
  toWritableReview,
  toWrittenReview,
} from '@/pages/myReviews/utils/myReviewViewModel'
import { useIntersectionObserver } from '@/shared/hooks'

export const useMyReviewsPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<MyReviewTabTypes>(
    MY_REVIEW_TAB_ITEMS.writable.value,
  )
  const [openedMenuReviewId, setOpenedMenuReviewId] = useState<string | null>(
    null,
  )
  const isLoadMoreLockedRef = useRef(false)
  const [isEditComingSoonDialogOpen, setIsEditComingSoonDialogOpen] =
    useState(false)
  const isWritableTab = activeTab === MY_REVIEW_TAB_ITEMS.writable.value
  const writableQuery = useVisitedReservationsInfiniteQuery(
    { reviewStatus: 'unreviewed', size: 20 },
    isWritableTab,
  )
  const writtenQuery = useMyReviewsInfiniteQuery(!isWritableTab)
  const reviewCountQuery = useMyReviewCountQuery()
  const deleteReviewMutation = useDeleteReviewMutation()

  const writableReviews = useMemo(
    () =>
      (writableQuery.data?.pages ?? []).flatMap((page) =>
        (page.content ?? []).map(toWritableReview),
      ),
    [writableQuery.data?.pages],
  )
  const writtenReviews = useMemo(
    () =>
      (writtenQuery.data?.pages ?? []).flatMap((page) =>
        (page.content ?? []).map(toWrittenReview),
      ),
    [writtenQuery.data?.pages],
  )
  const writableCount = writableQuery.data?.pages[0]?.totalCount
  const writtenCount = reviewCountQuery.data?.myReviewCount

  const tabItems = useMemo(
    () => [
      {
        ...MY_REVIEW_TAB_ITEMS.writable,
        count: writableCount,
      },
      {
        ...MY_REVIEW_TAB_ITEMS.written,
        count: writtenCount,
      },
    ],
    [writableCount, writtenCount],
  )

  const activeQuery = isWritableTab ? writableQuery : writtenQuery
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = activeQuery
  const loadMoreRef = useIntersectionObserver<HTMLDivElement>({
    enabled: hasNextPage && !isFetchingNextPage,
    onIntersect: () => {
      if (isLoadMoreLockedRef.current || !hasNextPage || isFetchingNextPage) {
        return
      }

      isLoadMoreLockedRef.current = true

      void fetchNextPage()
        .catch(() => {})
        .finally(() => {
          isLoadMoreLockedRef.current = false
        })
    },
    rootMargin: '160px 0px',
  })

  const handleBack = () => {
    navigate(ROUTES.mypage)
  }

  const handleChangeTab = (value: MyReviewTabTypes) => {
    setActiveTab(value)
    setOpenedMenuReviewId(null)
  }

  const handleNavigateToReviewNew = (
    restaurantId: string,
    reservationId: string,
  ) => {
    const pathname = generatePath(ROUTES.reviewNew, { restaurantId })
    const searchParams = new URLSearchParams({ reservationId })

    navigate(`${pathname}?${searchParams.toString()}`)
  }

  const handleNavigateToReviewDetail = (reviewId: string) => {
    navigate(generatePath(ROUTES.reviewDetail, { reviewId }))
  }

  const handleOpenReviewEditComingSoonDialog = () => {
    setIsEditComingSoonDialogOpen(true)
  }

  const handleReviewEditComingSoonDialogOpenChange = (open: boolean) => {
    setIsEditComingSoonDialogOpen(open)
  }

  const handleNavigateToTodayRestaurant = () => {
    navigate(ROUTES.todayRestaurant)
  }

  const handleToggleReviewMenu = (reviewId: string) => {
    setOpenedMenuReviewId((currentReviewId) =>
      currentReviewId === reviewId ? null : reviewId,
    )
  }

  const handleCloseReviewMenu = () => {
    setOpenedMenuReviewId(null)
  }

  const handleDeleteReview = async (reviewId: string) => {
    setOpenedMenuReviewId(null)
    await deleteReviewMutation.mutateAsync(Number(reviewId))
  }

  const handleRetry = () => {
    void activeQuery.refetch()
  }

  return {
    activeTab,
    currentCount: isWritableTab ? writableCount : writtenCount,
    isDeletePending: deleteReviewMutation.isPending,
    isEditComingSoonDialogOpen,
    isError: activeQuery.isError,
    isFetchingNextPage,
    isPending: activeQuery.isPending,
    isWritableTab,
    loadMoreRef,
    openedMenuReviewId,
    pendingDeleteReviewId: deleteReviewMutation.variables,
    tabItems,
    writableReviews,
    writtenReviews,
    handleBack,
    handleChangeTab,
    handleCloseReviewMenu,
    handleDeleteReview,
    handleNavigateToReviewDetail,
    handleNavigateToReviewNew,
    handleNavigateToTodayRestaurant,
    handleOpenReviewEditComingSoonDialog,
    handleRetry,
    handleReviewEditComingSoonDialogOpenChange,
    handleToggleReviewMenu,
  }
}
