import type { RefObject } from 'react'
import { useInfiniteScrollTrigger } from '@/shared/hooks/useInfiniteScrollTrigger'

import { MapRestaurantCard } from '@/pages/map/components/MapRestaurantCard'
import { MapSortMenu } from '@/pages/map/components/MapSortMenu'
import { MapStatusView } from '@/pages/map/components/MapStatusView'
import type { MapRestaurant, MapSort } from '@/pages/map/types'

interface MapRestaurantListProps {
  restaurants: MapRestaurant[]
  sort: MapSort
  filtered: boolean
  sortTriggerRef: RefObject<HTMLButtonElement | null>
  onSortChange: (sort: MapSort) => void
  onSelect: (id: string) => void
  onSave: () => void
  status?: 'loading' | 'success' | 'error'
  emptyKind?: 'region' | 'conditions'
  onRetry?: () => void
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
  emptyKind = 'conditions',
  onRetry,
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
    <div className="px-5 pb-5" data-map-list="">
      {status !== 'error' &&
        (status === 'loading' || restaurants.length > 0) && (
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
        <div className="py-[67px]">
          <MapStatusView
            loading={status === 'loading'}
            message={
              status === 'loading'
                ? '식당 목록을 불러오고 있어요.'
                : '식당 목록을 불러오지 못했어요!'
            }
            onRetry={status === 'error' ? onRetry : undefined}
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
      ) : emptyKind === 'conditions' ? (
        <p
          role="status"
          className="typo-caption-1 text-warm-gray-300 py-[67px] text-center font-medium"
        >
          조건에 맞는 맛집이 없어요.
        </p>
      ) : null}
      {status === 'success' &&
        nextCursor &&
        (nextError ? (
          <div className="flex min-h-68 items-center justify-center">
            <MapStatusView
              message="식당 목록을 불러오지 못했어요!"
              onRetry={onLoadNext}
            />
          </div>
        ) : (
          <div ref={sentinelRef} className="min-h-px">
            {loadingNext && (
              <MapStatusView loading message="식당 목록을 불러오고 있어요." />
            )}
          </div>
        ))}
    </div>
  )
}
