import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '../../utils'

export type BottomNavigationItem = {
  value: string
  label: string
  icon: ReactNode
}

export type BottomNavigationProps = Omit<
  ComponentPropsWithoutRef<'nav'>,
  'children'
> & {
  value: string
  items: BottomNavigationItem[]
  onValueChange?: (value: string) => void
}

export const BottomNavigation = ({
  value,
  items,
  onValueChange,
  className,
  style,
  'aria-label': ariaLabel = '하단 내비게이션',
  ...props
}: BottomNavigationProps) => {
  const gridTemplateColumns =
    items.length > 0 ? `repeat(${items.length}, minmax(0, 1fr))` : undefined

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'h-[84px] w-full bg-white px-[35px] pt-[5px] pb-[10px]',
        className,
      )}
      style={style}
      {...props}
    >
      <ul
        className="m-0 grid h-12 w-full list-none items-center p-0"
        style={{ gridTemplateColumns }}
      >
        {items.map((item) => {
          const isActive = item.value === value

          return (
            <li className="flex min-w-0 justify-center" key={item.value}>
              <button
                aria-current={isActive ? 'page' : undefined}
                className="focus-visible:outline-cool-gray-900 flex h-12 w-full max-w-12 appearance-none flex-col items-center justify-center gap-[3px] rounded-[4px] border-0 bg-transparent p-0 font-sans focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => {
                  if (!isActive) {
                    onValueChange?.(item.value)
                  }
                }}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-6 items-center justify-center text-[24px]',
                    isActive ? 'text-cool-gray-900' : 'text-warm-gray-300',
                  )}
                >
                  {item.icon}
                </span>
                <span className="typo-caption-5 text-cool-gray-900 w-full truncate text-center whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
