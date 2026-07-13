import { Badge } from '@hashi/hds-ui'
import type { Ref } from 'react'

import { RestaurantImage } from '@/features/restaurantDetail/components/RestaurantImage'
import type { RestaurantMenu } from '@/features/restaurantDetail/types/restaurantDetail'

interface RestaurantMenuSectionProps {
  menus: RestaurantMenu[]
  hasMoreMenus?: boolean
  loadMoreRef?: Ref<HTMLDivElement>
  onPressMenuItem: (menuId: string) => void
}

export const RestaurantMenuSection = ({
  menus,
  hasMoreMenus = false,
  loadMoreRef,
  onPressMenuItem,
}: RestaurantMenuSectionProps) => {
  return (
    <section aria-label="메뉴 목록" className="px-5">
      {menus.map((menu) => {
        const handleClick = () => {
          onPressMenuItem(menu.id)
        }

        return (
          <button
            className="border-warm-gray-50 flex h-[140px] w-full items-center border-b pt-4 pb-3 text-left last:border-b-0"
            key={menu.id}
            onClick={handleClick}
            type="button"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-1.5 pr-5">
              {menu.isRepresentative ? (
                <Badge
                  className="typo-caption-5 border-primary-400 text-primary-400 w-fit rounded-full px-1 py-0.5"
                  label="대표"
                />
              ) : null}
              <span className="typo-sub-header-2 text-primary-200 truncate">
                {menu.name}
              </span>
              <span className="typo-body-7 text-cool-gray-600 line-clamp-2 break-keep">
                {menu.description}
              </span>
              <span className="typo-body-3 text-primary-200 flex gap-0.5">
                <span className="font-medium">{menu.priceCurrency}</span>
                <span className="font-semibold">{menu.price}</span>
              </span>
            </span>
            <RestaurantImage
              className="size-[100px] shrink-0 rounded-[5px] object-cover"
              defaultImageTestId="restaurant-menu-default-image"
              logoSize="sm"
              src={menu.imageUrl}
            />
          </button>
        )
      })}
      {hasMoreMenus && loadMoreRef ? (
        <div ref={loadMoreRef} aria-hidden="true" className="h-1" />
      ) : null}
    </section>
  )
}
