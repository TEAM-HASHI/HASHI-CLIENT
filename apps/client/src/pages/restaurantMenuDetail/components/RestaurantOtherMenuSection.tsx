import type { Ref } from 'react'

import { RestaurantMenuSection } from '@/features/restaurantDetail/components/RestaurantMenuSection'
import type { RestaurantMenu } from '@/features/restaurantDetail/types/restaurantDetail'

interface RestaurantOtherMenuSectionProps {
  menus: RestaurantMenu[]
  hasMoreMenus: boolean
  loadMoreRef: Ref<HTMLDivElement>
  totalCount: number
  onPressMenuItem: (menuId: string) => void
}

export const RestaurantOtherMenuSection = ({
  menus,
  hasMoreMenus,
  loadMoreRef,
  totalCount,
  onPressMenuItem,
}: RestaurantOtherMenuSectionProps) => {
  return (
    <section aria-labelledby="other-menu-heading">
      <h2
        className="typo-sub-header-1 text-primary-200 px-5 pt-7"
        id="other-menu-heading"
      >
        다른 메뉴 <span className="text-warm-gray-300">{totalCount}</span>
      </h2>
      <div className="mt-2">
        <RestaurantMenuSection
          hasMoreMenus={hasMoreMenus}
          loadMoreRef={loadMoreRef}
          menus={menus}
          onPressMenuItem={onPressMenuItem}
        />
      </div>
    </section>
  )
}
