import { Button } from '@hashi/hds-ui'
import type { RefObject } from 'react'

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
  onReset: () => void
  status?: 'loading' | 'success' | 'error'
  onRetry?: () => void
  nextCursor?: string
  nextError?: boolean
  loadingNext?: boolean
  onLoadNext?: () => void
}

export const MapRestaurantList = ({
  restaurants,
  sort,
  filtered,
  sortTriggerRef,
  onSortChange,
  onSelect,
  onSave,
  onReset,
  status = 'success',
  onRetry,
  nextCursor,
  nextError,
  loadingNext,
  onLoadNext,
}: MapRestaurantListProps) => (
  <div className="px-5 pb-5" data-map-list="">
    <div className="flex items-center justify-between gap-2">
      <h2 className="typo-sub-header-3 text-cool-gray-600 min-w-0 truncate">
        {filtered ? '검색한 맛집' : '지금 도쿄에서 제일 핫한 맛집'}
      </h2>
      <MapSortMenu
        value={sort}
        onChange={onSortChange}
        triggerRef={sortTriggerRef}
      />
    </div>
    {status !== 'success' ? (
      <MapStatusView
        loading={status === 'loading'}
        message={
          status === 'loading'
            ? '식당 목록을 불러오고 있어요.'
            : '식당 목록을 불러오지 못했어요.'
        }
        onRetry={status === 'error' ? onRetry : undefined}
      />
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
    ) : (
      <div className="flex flex-col items-center gap-4 py-10" role="status">
        <p className="typo-body-7">검색 조건에 맞는 식당이 없어요.</p>
        <Button size="md" variant="neutral" onClick={onReset}>
          검색 조건 초기화
        </Button>
      </div>
    )}
    {status === 'success' && nextCursor && (
      <Button onClick={onLoadNext} disabled={loadingNext}>
        {nextError ? '다시 시도하기' : loadingNext ? '불러오는 중' : '더 보기'}
      </Button>
    )}
  </div>
)
