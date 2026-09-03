import { Button } from '@hashi/hds-ui'

import { RestaurantCard } from '@/features/restaurantList'
import type { Restaurant } from '@/features/restaurantList/types'
import { ListEmptyState } from '@/shared/components/listEmptyState'

interface ReservationRescueRestaurantListProps {
  isError: boolean
  isLoading: boolean
  restaurants: Restaurant[]
  onHashiPick: () => void
  onRestaurant: (restaurantId: string) => void
  onRetry: () => void
}

const ReservationRescueRestaurantListSkeleton = () => {
  return (
    <ul aria-label="추천 식당 목록 로딩 중" className="flex flex-col px-5">
      {Array.from({ length: 3 }, (_, index) => (
        <li
          aria-hidden="true"
          className="border-warm-gray-50 w-full border-b py-4.75 last:border-b-0"
          key={index}
        >
          <div className="bg-secondary-200 h-5 w-40 animate-pulse rounded" />
          <div className="bg-secondary-200 mt-2 h-5 w-28 animate-pulse rounded" />
          <div className="mt-2.75 flex gap-2 overflow-hidden">
            {Array.from({ length: 3 }, (_, imageIndex) => (
              <div
                className="bg-secondary-200 size-33.75 shrink-0 animate-pulse rounded-[5px]"
                key={imageIndex}
              />
            ))}
          </div>
          <div className="bg-secondary-200 mt-3 h-4 w-full animate-pulse rounded" />
          <div className="bg-secondary-200 mt-2 h-4 w-3/4 animate-pulse rounded" />
        </li>
      ))}
    </ul>
  )
}

export const ReservationRescueRestaurantList = ({
  isError,
  isLoading,
  restaurants,
  onHashiPick,
  onRestaurant,
  onRetry,
}: ReservationRescueRestaurantListProps) => {
  if (isLoading) {
    return <ReservationRescueRestaurantListSkeleton />
  }

  if (isError) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="typo-body-4 text-primary-200">
          식당 목록을 불러오지 못했어요
        </p>
        <Button onClick={onRetry} size="sm" variant="neutral">
          다시 시도
        </Button>
      </div>
    )
  }

  if (restaurants.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-5 px-5">
        <ListEmptyState description="지금 추천할 식당을 찾지 못했어요" />
        <Button onClick={onHashiPick} size="md">
          하시 PICK 둘러보기
        </Button>
      </div>
    )
  }

  return (
    <ul aria-label="추천 식당 목록" className="flex flex-col px-5">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          onClick={onRestaurant}
          restaurant={restaurant}
        />
      ))}
    </ul>
  )
}
