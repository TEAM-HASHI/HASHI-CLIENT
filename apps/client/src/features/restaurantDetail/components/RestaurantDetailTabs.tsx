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
    <div className="px-5">
      <Tabs
        className="z-raised relative h-[50px]"
        items={tabItems}
        onChange={handleChange}
        value={activeTab}
      />
    </div>
  )
}
