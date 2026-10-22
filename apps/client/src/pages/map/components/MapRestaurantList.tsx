import type { RefObject } from 'react'
import { useInfiniteScrollTrigger } from '@/shared/hooks/useInfiniteScrollTrigger'

import { MapRestaurantCard } from '@/pages/map/components/MapRestaurantCard'
import { MapSortMenu } from '@/pages/map/components/MapSortMenu'
import { MapStatusView } from '@/pages/map/components/MapStatusView'
import type { MapRestaurant, MapSort } from '@/pages/map/types'
import { cn } from '@/shared/utils'

interface MapRestaurantListProps {
  restaurants: MapRestaurant[]
  sort: MapSort
  filtered: boolean
  sortTriggerRef: RefObject<HTMLButtonElement | null>
  onSortChange: (sort: MapSort) => void
  onSelect: (id: string) => void
  onSave: () => void
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
  sort,
  filtered,
  sortTriggerRef,
  onSortChange,
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
      className={cn(
        'px-5',
        status === 'loading'
          ? 'flex min-h-full items-center justify-center pt-6'
          : 'pb-5',
      )}
      data-map-list=""
    >
      {status === 'success' && restaurants.length > 0 && (
        <div className="flex min-h-7 items-center justify-between gap-2 py-1">
          <h2 className="typo-sub-header-3 text-cool-gray-600 min-w-0 truncate">
            {filtered ? '검색한 맛집' : '지금 도쿄에서 제일 핫한 맛집'}
          </h2>
          <MapSortMenu
            value={sort}
            onChange={onSortChange}
            triggerRef={sortTriggerRef}
          />
        </div>
      )}
      {status !== 'success' ? (
        <div className={status === 'loading' ? undefined : 'py-[67px]'}>
          <MapStatusView
            loading={status === 'loading'}
            message={
              status === 'loading'
                ? '식당 목록을 불러오고 있어요.'
                : (errorMessage ?? '식당 목록을 불러오지 못했어요!')
            }
            onRetry={status === 'error' ? onRetry : undefined}
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
                onSave={onSave}
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
          <div
            ref={sentinelRef}
            className={
              loadingNext
                ? 'flex min-h-68 items-center justify-center'
                : 'min-h-px'
            }
          >
            {loadingNext && (
              <MapStatusView loading message="식당 목록을 불러오고 있어요." />
            )}
          </div>
        ))}
    </div>
  )
}
