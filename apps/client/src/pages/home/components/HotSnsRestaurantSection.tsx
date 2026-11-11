import { Link } from 'react-router-dom'
import { NextIcon } from '@hashi/hds-icons'
import { Thumbnail } from '@hashi/hds-ui'

import type { HotSnsRestaurant } from '@/pages/home/homeContent'

interface HotSnsRestaurantSectionProps {
  getRestaurantDetailPath: (restaurantId: string) => string
  isLoading: boolean
  listPath: string
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
  listPath,
  restaurants,
}: HotSnsRestaurantSectionProps) => {
  if (!isLoading && restaurants.length === 0) {
    return null
  }

  return (
    <section className="mt-[29px]" aria-labelledby="home-sns-heading">
      <Link
        className="flex min-h-6 w-full items-center justify-between gap-2"
        to={listPath}
      >
        <h2
          className="typo-sub-header-1 text-primary-200"
          id="home-sns-heading"
        >
          SNS에서 핫한 일본 식당
        </h2>
        <span className="text-primary-200 flex size-6 shrink-0 items-center justify-center">
          <NextIcon aria-hidden="true" className="size-5" />
        </span>
      </Link>
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
                    <Thumbnail alt={imageAlt} size="sm" src={imageUrl} />
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
