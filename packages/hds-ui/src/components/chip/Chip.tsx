import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cva } from 'class-variance-authority'

import { cn } from '../../utils'

export type ChipProps = Omit<
  ComponentPropsWithoutRef<'button'>,
  | 'aria-disabled'
  | 'aria-pressed'
  | 'children'
  | 'disabled'
  | 'onClick'
  | 'type'
> & {
  children: ReactNode
  count?: ReactNode
  onSelectedChange?: (selected: boolean) => void
  selected?: boolean
}

const chipVariants = cva(
  'inline-flex h-9 max-w-full cursor-pointer appearance-none items-center justify-center gap-0.5 rounded-full border-0 px-3 py-2 text-center font-sans transition-colors focus-visible:outline-cool-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2',
  {
    variants: {
      selected: {
        true: 'bg-cool-gray-800 text-white hover:bg-cool-gray-700 active:bg-cool-gray-900',
        false:
          'bg-warm-gray-50 text-primary-200 hover:bg-warm-gray-100 active:bg-warm-gray-300',
      },
    },
  },
)

const chipLabelVariants = cva(
  'typo-body-6 min-w-0 truncate leading-[1.36] whitespace-nowrap',
)

const chipCountVariants = cva(
  'typo-caption-1 shrink-0 leading-[1.5] whitespace-nowrap',
)

export const Chip = ({
  children,
  className,
  count,
  onSelectedChange,
  selected = false,
  ...props
}: ChipProps) => {
  const handleClick = () => {
    onSelectedChange?.(!selected)
  }

  return (
    <button
      {...props}
      aria-pressed={selected}
      className={cn(chipVariants({ selected }), className)}
      onClick={handleClick}
      type="button"
    >
      <span className={cn(chipLabelVariants())}>{children}</span>
      {count !== undefined && count !== null ? (
        <span className={cn(chipCountVariants())}>{count}</span>
      ) : null}
    </button>
  )
}
