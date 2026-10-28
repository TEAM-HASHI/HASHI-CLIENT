import type { Ref } from 'react'

import { RestaurantMenuListSection } from '@/features/restaurantDetail/components/RestaurantMenuListSection'
import type { RestaurantMenu } from '@/features/restaurantDetail/types/restaurantDetail'

interface RestaurantOtherMenuSectionProps {
  menus: RestaurantMenu[]
  hasMoreMenus: boolean
  isError?: boolean
  isLoading?: boolean
  isNextPageError?: boolean
  onRetry?: () => void
  loadMoreRef: Ref<HTMLDivElement>
  totalCount: number
  onPressMenuItem: (menuId: string) => void
}

export const RestaurantOtherMenuSection = ({
  menus,
  hasMoreMenus,
  isError,
  isLoading,
  isNextPageError,
  onRetry,
  loadMoreRef,
  totalCount,
  onPressMenuItem,
}: RestaurantOtherMenuSectionProps) => {
  return (
    <section aria-labelledby="other-menu-heading">
      <h2
        className="typo-sub-header-1 text-primary-200 flex items-center gap-0.5 px-5 pt-7"
        id="other-menu-heading"
      >
        <span>다른 메뉴</span>
        <span>{totalCount}</span>
      </h2>
      <div className="mt-2">
        <RestaurantMenuListSection
          hasMoreMenus={hasMoreMenus}
          isMenuListError={isError}
          isLoading={isLoading}
          isNextPageError={isNextPageError}
          onRetryMenuList={onRetry}
          loadMoreRef={loadMoreRef}
          menus={menus}
          onPressMenuItem={onPressMenuItem}
        />
      </div>
    </section>
  )
}
