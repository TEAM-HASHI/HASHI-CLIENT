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

const tabButtonVariants = cva(
  'relative z-raised flex h-full min-w-0 flex-1 items-center justify-center gap-1',
)

const tabLabelVariants = cva('truncate', {
  variants: {
    selected: {
      true: 'typo-sub-header-2 text-primary-200',
      false: 'typo-body-4 text-warm-gray-300',
    },
  },
})

const tabCountVariants = cva('shrink-0', {
  variants: {
    selected: {
      true: 'typo-caption-1 text-primary-200',
      false: 'typo-caption-2 text-warm-gray-300',
    },
  },
})

export const Tabs = ({
  items,
  value,
  onChange,
  className,
  ...props
}: TabsProps) => {
  const selectedIndex = Math.max(
    items.findIndex((item) => item.value === value),
    0,
  )

  const handleTabSelect = (item: TabsItem) => {
    if (item.value === value) {
      return
    }
    onChange(item.value)
  }

  return (
    <div
      className={cn(
        'border-warm-gray-100 relative flex h-10 w-full border-b bg-white',
        className,
      )}
      {...props}
      role="tablist"
    >
      <div
        aria-hidden="true"
        className="bg-primary-200 pointer-events-none absolute bottom-0 left-0 h-0.5 translate-y-px transition-transform duration-200 ease-out motion-reduce:transition-none"
        data-hds-tabs-indicator=""
        style={{
          width: `${100 / items.length}%`,
          transform: `translateX(${selectedIndex * 100}%)`,
        }}
      />
      {items.map((item) => {
        const isSelected = item.value === value

        return (
          <button
            key={item.value}
            type="button"
            aria-selected={isSelected}
            className={cn(tabButtonVariants())}
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
