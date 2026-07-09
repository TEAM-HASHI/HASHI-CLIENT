import type { RestaurantMenu } from '@/features/restaurantDetail/types/restaurantDetail'

interface RestaurantSelectedMenuSectionProps {
  menu: RestaurantMenu
}

export const RestaurantSelectedMenuSection = ({
  menu,
}: RestaurantSelectedMenuSectionProps) => {
  return (
    <section className="border-warm-gray-50 border-b-8 p-6">
      <h1 className="typo-header-3 text-primary-200">{menu.name}</h1>
      <p className="typo-body-2 text-primary-400 mt-1 flex gap-0.5">
        <span className="font-medium">{menu.priceCurrency}</span>
        <span className="font-semibold">{menu.price}</span>
      </p>
      <p className="typo-long-body-1 text-primary-200 mt-4 break-keep">
        {menu.description}
      </p>
    </section>
  )
}
