import { Tabs } from '@hashi/hds-ui'

import { RESTAURANT_DETAIL_TABS } from '@/features/restaurantDetail/constants/restaurantDetailTabs'
import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'

interface RestaurantDetailTabsProps {
  activeTab: RestaurantDetailTab
  reviewCount: number
  onTabChange: (tab: RestaurantDetailTab) => void
}

export const RestaurantDetailTabs = ({
  activeTab,
  reviewCount,
  onTabChange,
}: RestaurantDetailTabsProps) => {
  const handleChange = (value: string) => {
    onTabChange(value as RestaurantDetailTab)
  }

  const tabItems = RESTAURANT_DETAIL_TABS.map((item) =>
    item.value === 'review' ? { ...item, count: reviewCount } : item,
  )

  return (
    <div className="after:border-warm-gray-100 relative bg-white after:absolute after:inset-x-5 after:bottom-0 after:border-b after:content-['']">
      <Tabs
        className="relative z-10 h-[50px] border-b-0 px-5"
        items={tabItems}
        onChange={handleChange}
        value={activeTab}
      />
    </div>
  )
}
