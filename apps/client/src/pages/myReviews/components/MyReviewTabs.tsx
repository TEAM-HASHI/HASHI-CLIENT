import type { MyReviewTabTypes } from '@/pages/myReviews/constants/myReviewTabs'
import { cn } from '@/shared/utils'

interface MyReviewTabItem {
  label: string
  value: MyReviewTabTypes
  count?: number
}

interface MyReviewTabsProps {
  items: MyReviewTabItem[]
  value: MyReviewTabTypes
  onChange: (value: MyReviewTabTypes) => void
}

export const MyReviewTabs = ({ items, value, onChange }: MyReviewTabsProps) => {
  return (
    <div
      className="flex h-10 items-end justify-center bg-white px-5 text-center whitespace-nowrap"
      role="tablist"
    >
      {items.map((item) => {
        const isSelected = item.value === value

        return (
          <button
            key={item.value}
            aria-selected={isSelected}
            className={cn(
              'flex h-full min-w-0 flex-1 items-center justify-center gap-1 py-2.5',
              isSelected
                ? 'border-primary-200 text-primary-200 border-b-2'
                : 'border-warm-gray-100 text-warm-gray-300 border-b',
            )}
            onClick={() => onChange(item.value)}
            role="tab"
            type="button"
          >
            <span
              className={cn(
                'truncate',
                isSelected ? 'typo-sub-header-2' : 'typo-body-4',
              )}
            >
              {item.label}
            </span>
            {item.count !== undefined ? (
              <span
                className={cn(
                  'shrink-0 text-xs',
                  isSelected ? 'leading-normal font-medium' : 'typo-caption-2',
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
