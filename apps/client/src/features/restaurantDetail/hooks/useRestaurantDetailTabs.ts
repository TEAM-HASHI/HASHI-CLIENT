import { useState } from 'react'

import type { ReviewSortValue } from '@/features/restaurantDetail/constants/restaurantReview'
import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'

interface UseRestaurantDetailTabsParams {
  initialTab?: RestaurantDetailTab
}

export const useRestaurantDetailTabs = ({
  initialTab,
}: UseRestaurantDetailTabsParams) => {
  const [activeTab, setActiveTab] = useState<RestaurantDetailTab>(
    initialTab ?? 'info',
  )
  const [selectedReviewSort, setSelectedReviewSort] =
    useState<ReviewSortValue>('latest')

  const resetTabsToDefault = () => {
    setActiveTab('info')
    setSelectedReviewSort('latest')
  }

  return {
    activeTab,
    onSelectReviewSort: setSelectedReviewSort,
    onTabChange: setActiveTab,
    resetTabsToDefault,
    selectedReviewSort,
  }
}
