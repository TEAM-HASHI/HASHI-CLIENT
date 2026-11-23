import { IconButton, SearchBar } from '@hashi/hds-ui'
import {
  BarCategoryIcon,
  CafeCategoryIcon,
  CancelIcon,
  RestaurantCategoryIcon,
} from '@hashi/hds-icons'

import type { MapConditions } from '@/pages/map/types'
import { cn } from '@/shared/utils'

interface MapToolbarProps {
  draft: string
  category: MapConditions['category']
  onSearch: () => void
  onClear: () => void
  onCategoryChange: (category: MapConditions['category']) => void
}

const CATEGORIES = [
  { value: 'all', label: '전체', Icon: null },
  { value: 'restaurant', label: '식당', Icon: RestaurantCategoryIcon },
  { value: 'bar', label: '주점', Icon: BarCategoryIcon },
  { value: 'cafe', label: '카페', Icon: CafeCategoryIcon },
] as const

export const MapToolbar = ({
  draft,
  category,
  onSearch,
  onClear,
  onCategoryChange,
}: MapToolbarProps) => (
  <div className="absolute inset-x-0 top-[calc(12px+var(--safe-area-top,0px))]">
    <div className="relative mx-5">
      <SearchBar
        aria-label="식당 혹은 메뉴 검색"
        className="bg-white shadow-[0_0_4px_rgba(0,0,0,0.2)]"
        placeholder="식당 혹은 메뉴를 검색해보세요"
        value={draft}
        readOnly
        onClick={onSearch}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onSearch()
          }
        }}
        inputClassName={draft ? 'pr-8 cursor-pointer' : 'cursor-pointer'}
      />
      {draft && (
        <IconButton
          aria-label="지도 검색어 지우기"
          className="absolute top-0 right-0 size-11"
          onClick={onClear}
        >
          <CancelIcon className="size-6" />
        </IconButton>
      )}
    </div>
    <div
      className="mt-3 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 pb-1 [&::-webkit-scrollbar]:hidden"
      aria-label="음식 종류"
    >
      {CATEGORIES.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={category === value}
          className={cn(
            'typo-body-6 focus-visible:outline-cool-gray-900 inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-0.5 rounded-full px-3 py-2 leading-[1.36] whitespace-nowrap shadow-[0_0_4px_rgba(0,0,0,0.2)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
            category === value && value !== 'all'
              ? 'bg-cool-gray-800 text-primary-100 hover:bg-cool-gray-700 active:bg-cool-gray-900'
              : 'text-primary-200 hover:bg-primary-100 bg-white active:bg-[#f2f3f5]',
          )}
          onClick={() => onCategoryChange(category === value ? 'all' : value)}
        >
          {Icon && (
            <Icon
              aria-hidden="true"
              focusable="false"
              className="size-4 shrink-0"
            />
          )}
          {label}
        </button>
      ))}
    </div>
  </div>
)
