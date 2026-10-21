import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation'
import { useMyPointBalanceQuery } from '@/features/point'
import { useMyReviewCountQuery } from '@/features/review/queries/useMyReviewCountQuery'
import { useMyProfileSummaryQuery } from '@/features/user'
import {
  createMypagePrimaryMenuItems,
  mypageMenuSections,
} from '@/pages/mypage/constants/mypageMenu'
import type { MypageMenuAction, MypageSummary } from '@/pages/mypage/types'

export const useMypagePage = () => {
  const navigate = useNavigate()
  const logoutMutation = useLogoutMutation(() => {
    navigate(ROUTES.loginRequired, { replace: true })
  })
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)
  const myReviewCountQuery = useMyReviewCountQuery()
  const pointBalanceQuery = useMyPointBalanceQuery()
  const profileSummaryQuery = useMyProfileSummaryQuery()
  const queryError =
    profileSummaryQuery.error ??
    pointBalanceQuery.error ??
    myReviewCountQuery.error

  if (queryError) {
    throw queryError
  }

  const isLoading =
    profileSummaryQuery.isPending ||
    pointBalanceQuery.isPending ||
    myReviewCountQuery.isPending

  const summary: MypageSummary = {
    nickname: profileSummaryQuery.data?.nickname ?? '하시',
    profileImageUrl: profileSummaryQuery.data?.profileImageUrl ?? null,
    availablePoint: pointBalanceQuery.data?.availablePoint ?? 0,
    myReviewCount: myReviewCountQuery.data?.myReviewCount ?? 0,
  }
  const primaryMenuItems = createMypagePrimaryMenuItems({
    myReviewCount: summary.myReviewCount,
  })

  const handleProfileEdit = () => {
    navigate(ROUTES.profileEdit)
  }

  const handleMenuAction = (action: MypageMenuAction) => {
    if (action.type === 'logout') {
      if (!logoutMutation.isPending) {
        logoutMutation.mutate()
      }
      return
    }
    if (action.type === 'comingSoon') {
      setIsComingSoonOpen(true)
      return
    }

    if (action.type === 'navigate') {
      navigate(action.path)
      return
    }
  }

  return {
    isLoggingOut: logoutMutation.isPending,
    isComingSoonOpen,
    isLoading,
    menuSections: mypageMenuSections,
    primaryMenuItems,
    setIsComingSoonOpen,
    summary,
    handleProfileEdit,
    handleMenuAction,
  }
}
