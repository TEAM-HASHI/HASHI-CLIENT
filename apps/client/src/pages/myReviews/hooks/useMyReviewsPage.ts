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

const getVisibleCount = (count: number) => {
  return count > 0 ? count : undefined
}

export const useMyReviewsPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<MyReviewTabTypes>(
    MY_REVIEW_TAB_ITEMS.writable.value,
  )
  const [writtenReviews, setWrittenReviews] = useState(myWrittenReviewMocks)
  const [openedMenuReviewId, setOpenedMenuReviewId] = useState<string | null>(
    null,
  )

  const tabItems = useMemo(
    () => [
      {
        ...MY_REVIEW_TAB_ITEMS.writable,
        count: getVisibleCount(myWritableReviewMocks.length),
      },
      {
        ...MY_REVIEW_TAB_ITEMS.written,
        count: getVisibleCount(writtenReviews.length),
      },
    ],
    [writtenReviews.length],
  )

  const handleBack = () => {
    navigate(-1)
  }

  const handleChangeTab = (value: MyReviewTabTypes) => {
    setActiveTab(value)
    setOpenedMenuReviewId(null)
  }

  const handleNavigateToReviewNew = (restaurantId: string) => {
    navigate(generatePath(ROUTES.reviewNew, { restaurantId }))
  }

  const handleNavigateToReviewEdit = (reviewId: string) => {
    navigate(generatePath(ROUTES.reviewEdit, { reviewId }))
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
    openedMenuReviewId,
    tabItems,
    writableReviews: myWritableReviewMocks,
    writtenReviews,
    handleBack,
    handleChangeTab,
    handleCloseReviewMenu,
    handleDeleteReview,
    handleNavigateToReviewEdit,
    handleNavigateToReviewNew,
    handleNavigateToTodayRestaurant,
    handleToggleReviewMenu,
  }
}
