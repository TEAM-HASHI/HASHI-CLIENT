import type { RestaurantDetail } from '@/features/restaurantDetail/types/restaurantDetail'

interface RestaurantInfoSectionProps {
  restaurant: RestaurantDetail
}

export const RestaurantInfoSection = ({
  restaurant,
}: RestaurantInfoSectionProps) => {
  return (
    <div className="px-5 pt-9 pb-9">
      <section aria-labelledby="restaurant-detail-description-heading">
        <h2
          className="typo-sub-header-3 text-primary-200"
          id="restaurant-detail-description-heading"
        >
          가게 상세
        </h2>
        <p className="typo-long-body-1 text-primary-200 mt-3 break-keep">
          {restaurant.detailDescription}
        </p>
      </section>

      <section
        aria-labelledby="restaurant-business-hours-heading"
        className="mt-9"
      >
        <h2
          className="typo-sub-header-3 text-primary-200"
          id="restaurant-business-hours-heading"
        >
          영업 시간
        </h2>
        <p className="typo-body-5 text-primary-200 mt-3">
          영업 중 · {restaurant.lastOrderTime}에 라스트오더
        </p>
        <dl className="typo-body-5 text-primary-200 mt-4 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
          {restaurant.businessHours.map(({ day, hours }) => (
            <div className="contents" key={day}>
              <dt className="font-semibold">{day}</dt>
              <dd>{hours}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="restaurant-price-range-heading"
        className="mt-9"
      >
        <h2
          className="typo-sub-header-3 text-primary-200"
          id="restaurant-price-range-heading"
        >
          인당 가격대
        </h2>
        <p className="typo-body-5 text-primary-200 mt-3">
          {restaurant.priceRange}
        </p>
      </section>
    </div>
  )
}
