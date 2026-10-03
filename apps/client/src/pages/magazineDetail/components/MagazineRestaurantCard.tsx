import { ClockSmallIcon, MoneySmallIcon, StarFillIcon } from '@hashi/hds-icons'
import { Link } from 'react-router-dom'

import { getRestaurantDetailPath } from '@/app/router/routePaths'
import { MagazineImage } from '@/pages/magazineDetail/components/MagazineImage'
import type { MagazineDetailRestaurant } from '@/pages/magazineDetail/types'

interface MagazineRestaurantCardProps {
  restaurant: MagazineDetailRestaurant
}

export const MagazineRestaurantCard = ({
  restaurant,
}: MagazineRestaurantCardProps) => {
  return (
    <Link
      aria-label={`${restaurant.name} 상세 보기`}
      className="focus-visible:outline-cool-gray-900 block focus-visible:outline-2 focus-visible:outline-offset-2"
      to={getRestaurantDetailPath(restaurant.id)}
    >
      <article className="border-warm-gray-50 flex min-h-67 flex-col justify-center gap-2 border-b py-3">
        <div className="flex min-w-0 flex-col gap-0.75">
          <h3 className="typo-body-3 text-cool-gray-900 truncate">
            {restaurant.name}
          </h3>
          <div className="text-primary-200 flex min-h-6 items-center gap-1">
            <span className="typo-body-4 inline-flex items-center gap-0.5">
              <StarFillIcon
                aria-hidden="true"
                className="text-primary-400 size-4.5"
              />
              {restaurant.rating}
            </span>
            <span className="typo-body-7 truncate">
              {restaurant.region} · {restaurant.category}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {restaurant.imageUrls.length > 0 ? (
            <div className="[scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-2">
                {restaurant.imageUrls.map((imageUrl, index) => (
                  <MagazineImage
                    alt=""
                    className="size-33.75 shrink-0 rounded-[5px]"
                    key={`${restaurant.id}-${index}`}
                    src={imageUrl}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <dl className="typo-body-7 text-primary-200 flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <ClockSmallIcon
                aria-hidden="true"
                className="text-cool-gray-900 size-4 shrink-0"
              />
              <dt className="sr-only">영업시간</dt>
              <dd>{restaurant.openingHours}</dd>
            </div>
            <div className="flex min-h-5 items-center gap-1">
              <MoneySmallIcon
                aria-hidden="true"
                className="text-cool-gray-900 size-4 shrink-0"
              />
              <dt className="sr-only">가격대</dt>
              <dd>{restaurant.priceRange}</dd>
            </div>
          </dl>
        </div>
      </article>
    </Link>
  )
}
