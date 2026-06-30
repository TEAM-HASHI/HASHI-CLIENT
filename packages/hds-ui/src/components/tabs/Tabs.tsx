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
  'relative flex h-full min-w-0 flex-1 items-center justify-center gap-1',
  {
    variants: {
      selected: {
        true: 'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:translate-y-px after:bg-primary-200',
        false: null,
      },
    },
  },
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
  const handleTabSelect = (item: TabsItem) => {
    if (item.value === value) {
      return
    }
    onChange(item.value)
  }

  return (
    <div
      className={cn(
        'border-warm-gray-100 flex h-10 w-full border-b bg-white',
        className,
      )}
      {...props}
      role="tablist"
    >
      {items.map((item) => {
        const isSelected = item.value === value

        return (
          <button
            key={item.value}
            type="button"
            aria-selected={isSelected}
            className={cn(tabButtonVariants({ selected: isSelected }))}
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
