import { Chip, SearchBar } from '@hashi/hds-ui'

import type { MapConditions } from '@/pages/map/types'
import { cn } from '@/shared/utils'

interface MapToolbarProps {
  draft: string
  category: MapConditions['category']
  onDraftChange: (value: string) => void
  onSubmit: () => void
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
  onDraftChange,
  onSubmit,
  onCategoryChange,
}: MapToolbarProps) => (
  <div className="absolute inset-x-0 top-[calc(12px+var(--safe-area-top,0px))]">
    <form
      className="px-5"
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
        event.currentTarget.querySelector('input')?.blur()
      }}
    >
      <SearchBar
        aria-label="식당 혹은 메뉴 검색"
        className="bg-white shadow-[0_0_4px_rgba(0,0,0,0.2)]"
        placeholder="식당 혹은 메뉴를 검색해보세요"
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        enterKeyHint="search"
      />
    </form>
    <div
      className="mt-3 flex gap-2 overflow-x-auto px-5 pb-1"
      aria-label="음식 종류"
    >
      {CATEGORIES.map(({ value, label }) => (
        <Chip
          key={value}
          selected={category === value && value !== 'all'}
          aria-label={label}
          className={cn(
            'shrink-0 shadow-[0_0_4px_rgba(0,0,0,0.2)]',
            (category !== value || value === 'all') && 'bg-white',
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
