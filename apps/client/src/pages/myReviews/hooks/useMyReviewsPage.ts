import { useMemo, useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  MY_REVIEW_TAB_ITEMS,
  type MyReviewTabTypes,
} from '@/pages/myReviews/constants/myReviewTabs'
import {
  myWritableReviewMocks,
  myWrittenReviewMocks,
} from '@/pages/myReviews/mocks/myReviews.mock'

export const useMyReviewsPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<MyReviewTabTypes>(
    MY_REVIEW_TAB_ITEMS.writable.value,
  )
  const [writtenReviews, setWrittenReviews] = useState(myWrittenReviewMocks)
  const [openedMenuReviewId, setOpenedMenuReviewId] = useState<string | null>(
    null,
  )
  const [isEditComingSoonDialogOpen, setIsEditComingSoonDialogOpen] =
    useState(false)

  const tabItems = useMemo(
    () => [
      {
        ...MY_REVIEW_TAB_ITEMS.writable,
        count: myWritableReviewMocks.length,
      },
      {
        ...MY_REVIEW_TAB_ITEMS.written,
        count: writtenReviews.length,
      },
    ],
    [writtenReviews.length],
  )

  const handleBack = () => {
    navigate(ROUTES.mypage)
  }

  const handleChangeTab = (value: MyReviewTabTypes) => {
    setActiveTab(value)
    setOpenedMenuReviewId(null)
  }

  const handleNavigateToReviewNew = (restaurantId: string) => {
    navigate(generatePath(ROUTES.reviewNew, { restaurantId }))
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

  const handleDeleteReview = (reviewId: string) => {
    setWrittenReviews((currentReviews) =>
      currentReviews.filter((review) => review.id !== reviewId),
    )
    setOpenedMenuReviewId(null)
  }

  return {
    activeTab,
    isEditComingSoonDialogOpen,
    openedMenuReviewId,
    tabItems,
    writableReviews: myWritableReviewMocks,
    writtenReviews,
    handleBack,
    handleChangeTab,
    handleCloseReviewMenu,
    handleDeleteReview,
    handleNavigateToReviewDetail,
    handleNavigateToReviewNew,
    handleNavigateToTodayRestaurant,
    handleOpenReviewEditComingSoonDialog,
    handleReviewEditComingSoonDialogOpenChange,
    handleToggleReviewMenu,
  }
}
