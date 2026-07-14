import { Link } from 'react-router-dom'

import type { HotSnsRestaurant } from '@/pages/home/homeContent'
import { ImageWithDefaultFallback } from '@/shared/components/defaultImage'

interface HotSnsRestaurantSectionProps {
  getRestaurantDetailPath: (restaurantId: string) => string
  isLoading: boolean
  restaurants: HotSnsRestaurant[]
}

const renderSkeletonItems = () => {
  return Array.from({ length: 3 }, (_, index) => (
    <li
      aria-hidden="true"
      className="grid grid-cols-[60px_minmax(0,1fr)] gap-4"
      data-testid="home-sns-skeleton-item"
      key={index}
    >
      <div className="bg-secondary-200 size-[60px] animate-pulse rounded-[5px]" />
      <div className="flex min-w-0 flex-col justify-center gap-1.5">
        <div className="bg-secondary-200 h-5 w-40 animate-pulse rounded" />
        <div className="bg-secondary-200 h-4 w-56 animate-pulse rounded" />
      </div>
    </li>
  ))
}

export const HotSnsRestaurantSection = ({
  getRestaurantDetailPath,
  isLoading,
  restaurants,
}: HotSnsRestaurantSectionProps) => {
  if (!isLoading && restaurants.length === 0) {
    return null
  }

  return (
    <section className="mt-[29px]" aria-labelledby="home-sns-heading">
      <h2 className="typo-sub-header-1 text-primary-200" id="home-sns-heading">
        SNS에서 핫한 일본 식당
      </h2>
      <ul className="mt-5 flex flex-col gap-[14px]">
        {isLoading
          ? renderSkeletonItems()
          : restaurants.map(
              ({ restaurantId, name, summary, imageUrl, imageAlt }) => (
                <li key={restaurantId}>
                  <Link
                    className="grid grid-cols-[60px_minmax(0,1fr)] gap-4"
                    to={getRestaurantDetailPath(restaurantId)}
                  >
                    <ImageWithDefaultFallback
                      alt={imageAlt}
                      className="size-[60px] rounded-[5px] object-cover"
                      src={imageUrl}
                    />
                    <span className="flex min-w-0 flex-col justify-center gap-1.5">
                      <span className="typo-sub-header-2 text-primary-200 truncate">
                        {name}
                      </span>
                      <span className="typo-body-8 text-primary-200 truncate">
                        {summary}
                      </span>
                    </span>
                  </Link>
                </li>
              ),
            )}
      </ul>
    </section>
  )
}
