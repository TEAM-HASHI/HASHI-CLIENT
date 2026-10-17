import { Chip, IconButton, SearchBar } from '@hashi/hds-ui'
import { CancelIcon } from '@hashi/hds-icons'

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
  { value: 'all', label: '전체' },
  { value: 'restaurant', label: '음식점' },
  { value: 'bar', label: '주점' },
  { value: 'cafe', label: '카페' },
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
      className="mt-3 flex gap-2 overflow-x-auto px-5 pb-1"
      aria-label="음식 종류"
    >
      {CATEGORIES.map(({ value, label }) => (
        <Chip
          key={value}
          selected={category === value}
          aria-label={label}
          className={cn(
            'shrink-0 shadow-[0_0_4px_rgba(0,0,0,0.2)]',
            category !== value && 'bg-white',
          )}
          onSelectedChange={() =>
            onCategoryChange(category === value ? 'all' : value)
          }
        >
          {label}
        </Chip>
      ))}
    </div>
  </div>
)
