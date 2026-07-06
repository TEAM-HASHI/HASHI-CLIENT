import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  createMypagePrimaryMenuItems,
  mypageMenuSections,
} from '@/pages/mypage/constants/mypageMenu'
import { mypageSummaryMock } from '@/pages/mypage/mocks/mypage.mock'
import type { MypageMenuAction } from '@/pages/mypage/types'

export const useMypagePage = () => {
  const navigate = useNavigate()
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)

  const summary = mypageSummaryMock
  const primaryMenuItems = createMypagePrimaryMenuItems({
    myReviewCount: summary.myReviewCount,
    savedRestaurantCount: summary.savedRestaurantCount,
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

    window.open(action.url, '_blank', 'noopener,noreferrer')
  }

  return {
    isComingSoonOpen,
    menuSections: mypageMenuSections,
    primaryMenuItems,
    setIsComingSoonOpen,
    summary,
    handleComingSoonPress,
    handleMenuAction,
  }
}
