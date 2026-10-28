import { useInfiniteScrollTrigger } from '@/shared/hooks/useInfiniteScrollTrigger'

import { MapRestaurantCard } from '@/pages/map/components/MapRestaurantCard'
import { MapRestaurantListSkeleton } from '@/pages/map/components/MapRestaurantListSkeleton'
import { MapStatusView } from '@/pages/map/components/MapStatusView'
import type { MapRestaurant } from '@/pages/map/types'

interface MapRestaurantListProps {
  restaurants: MapRestaurant[]
  filtered: boolean
  onSelect: (id: string) => void
  onSave: (restaurantId: string) => void
  status?: 'loading' | 'success' | 'error'
  onRetry?: () => void
  retryDisabled?: boolean
  errorMessage?: string
  nextCursor?: string
  nextError?: boolean
  loadingNext?: boolean
  onLoadNext?: () => void
  active?: boolean
}

export const MapRestaurantList = ({
  restaurants,
  filtered,
  onSelect,
  onSave,
  status = 'success',
  onRetry,
  retryDisabled,
  errorMessage,
  nextCursor,
  nextError,
  loadingNext,
  onLoadNext,
  active = true,
}: MapRestaurantListProps) => {
  const sentinelRef = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled:
      active &&
      status === 'success' &&
      !!nextCursor &&
      !nextError &&
      !!onLoadNext,
    isLoading: loadingNext,
    rootMargin: '0px',
    onIntersect: () => onLoadNext?.(),
  })
  return (
    <div
      className="px-5 pb-5"
      aria-busy={status === 'loading' || loadingNext || undefined}
      data-map-list=""
    >
      {status === 'loading' ? (
        <MapRestaurantListSkeleton />
      ) : status === 'error' ? (
        <div className="py-[67px]">
          <MapStatusView
            message={errorMessage ?? '식당 목록을 불러오지 못했어요!'}
            onRetry={onRetry}
            retryDisabled={retryDisabled}
          />
        </div>
      ) : restaurants.length ? (
        <ul aria-label="식당 검색 결과">
          {restaurants.map((restaurant, index) => (
            <li key={restaurant.id}>
              <MapRestaurantCard
                restaurant={restaurant}
                rank={filtered ? undefined : index + 1}
                onSelect={() => onSelect(restaurant.id)}
                onSave={() => onSave(restaurant.id)}
              />
            </li>
          ))}
        </ul>
      ) : null}
      {status === 'success' &&
        (nextCursor || nextError) &&
        (nextError ? (
          <div className="flex min-h-68 items-center justify-center">
            <MapStatusView
              message="식당 목록을 불러오지 못했어요!"
              onRetry={onLoadNext}
              retryDisabled={retryDisabled}
            />
          </div>
        ) : (
          <div ref={sentinelRef} className="min-h-px">
            {loadingNext && <MapRestaurantListSkeleton count={1} />}
          </div>
        ))}
    </div>
  )
}
