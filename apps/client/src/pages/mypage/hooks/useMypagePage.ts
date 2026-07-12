import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { useMyPointBalanceQuery } from '@/features/point'
import { getMyReviewCount } from '@/pages/mypage/api/getMyReviewCount'
import { getMypageProfileSummary } from '@/pages/mypage/api/getMypageProfileSummary'
import {
  createMypagePrimaryMenuItems,
  mypageMenuSections,
} from '@/pages/mypage/constants/mypageMenu'
import type { MypageMenuAction, MypageSummary } from '@/pages/mypage/types'

const DEFAULT_MYPAGE_SUMMARY: MypageSummary = {
  nickname: '하시',
  profileImageUrl: null,
  availablePoint: 0,
  myReviewCount: 0,
}

export const useMypagePage = () => {
  const navigate = useNavigate()
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)
  const myReviewCountQuery = useQuery({
    queryFn: getMyReviewCount,
    queryKey: ['mypage', 'myReviewCount'],
  })
  const pointBalanceQuery = useMyPointBalanceQuery()
  const profileSummaryQuery = useQuery({
    queryFn: getMypageProfileSummary,
    queryKey: ['mypage', 'profileSummary'],
  })
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

  const summary = {
    ...DEFAULT_MYPAGE_SUMMARY,
    nickname:
      profileSummaryQuery.data?.nickname ?? DEFAULT_MYPAGE_SUMMARY.nickname,
    profileImageUrl:
      profileSummaryQuery.data?.profileImageUrl ??
      DEFAULT_MYPAGE_SUMMARY.profileImageUrl,
    availablePoint: pointBalanceQuery.data?.availablePoint ?? 0,
    myReviewCount: myReviewCountQuery.data?.myReviewCount ?? 0,
  }
  const primaryMenuItems = createMypagePrimaryMenuItems({
    myReviewCount: summary.myReviewCount,
  })

  const handleComingSoonPress = () => {
    setIsComingSoonOpen(true)
  }

  const handleMenuAction = (action: MypageMenuAction) => {
    if (action.type === 'comingSoon') {
      handleComingSoonPress()
      return
    }

    if (action.type === 'navigate') {
      navigate(action.path)
      return
    }

    if (!action.url) {
      handleComingSoonPress()
    }
  }

  return {
    isComingSoonOpen,
    isLoading,
    menuSections: mypageMenuSections,
    primaryMenuItems,
    setIsComingSoonOpen,
    summary,
    handleComingSoonPress,
    handleMenuAction,
  }
}
