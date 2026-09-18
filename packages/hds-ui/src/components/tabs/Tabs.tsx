import { type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils'

export type TabsItem = {
  value: string
  label: ReactNode
  count?: number
}

export type TabsProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'onChange'
> & {
  items: TabsItem[]
  value: string
  onChange: (value: string) => void
}

const tabButtonClassName =
  'flex min-w-0 flex-1 items-center justify-center gap-1 border-b border-warm-gray-100 py-2.5'

const tabIndicatorClassName =
  'bg-primary-200 pointer-events-none absolute bottom-0 left-0 z-raised h-0.5 transition-transform duration-200 ease-out motion-reduce:transition-none'

const tabLabelVariants = cva(
  'truncate transition-colors duration-200 ease-out motion-reduce:transition-none',
  {
    variants: {
      selected: {
        true: 'typo-sub-header-2 text-primary-200',
        false: 'typo-body-4 text-warm-gray-300',
      },
    },
  },
)

const tabCountVariants = cva(
  'shrink-0 transition-colors duration-200 ease-out motion-reduce:transition-none',
  {
    variants: {
      selected: {
        true: 'typo-caption-2 text-primary-200',
        false: 'typo-caption-2 text-warm-gray-300',
      },
    },
  },
)

const getTabIndicatorStyle = (itemCount: number, selectedIndex: number) => ({
  width: `calc(100% / ${itemCount})`,
  transform: `translateX(${Math.max(selectedIndex, 0) * 100}%)`,
})

export const Tabs = ({
  items,
  value,
  onChange,
  className,
  ...props
}: TabsProps) => {
  const selectedIndex = items.findIndex((item) => item.value === value)
  const hasSelectedItem = selectedIndex >= 0

  const handleTabSelect = (item: TabsItem) => {
    if (item.value === value) {
      return
    }
    onChange(item.value)
  }

  return (
    <div
      className={cn(
        'relative flex h-12.5 w-full items-end bg-white',
        className,
      )}
      {...props}
      role="tablist"
    >
      {hasSelectedItem ? (
        <div
          aria-hidden="true"
          className={tabIndicatorClassName}
          data-hds-tabs-indicator=""
          style={getTabIndicatorStyle(items.length, selectedIndex)}
        />
      ) : null}
      {items.map((item) => {
        const isSelected = item.value === value

        return (
          <button
            key={item.value}
            type="button"
            aria-selected={isSelected}
            className={tabButtonClassName}
            onClick={() => handleTabSelect(item)}
            role="tab"
          >
            <span className={cn(tabLabelVariants({ selected: isSelected }))}>
              {item.label}
            </span>
            {item.count !== undefined ? (
              <span className={cn(tabCountVariants({ selected: isSelected }))}>
                {item.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
