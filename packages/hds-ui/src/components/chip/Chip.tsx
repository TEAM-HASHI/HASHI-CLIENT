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
  onSelectedChange?: (selected: boolean) => void
  selected?: boolean
}

const chipVariants = cva(
  'inline-flex max-w-full cursor-pointer appearance-none items-center justify-center rounded-[10rem] border-0 px-3 py-2 text-center font-sans transition-colors focus-visible:outline-cool-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2',
  {
    variants: {
      selected: {
        true: 'bg-cool-gray-800 text-white',
        false: 'bg-warm-gray-50 text-primary-200',
      },
    },
  },
)

const chipLabelVariants = cva('typo-body-7 min-w-0 truncate whitespace-nowrap')

export const Chip = ({
  children,
  className,
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
    </button>
  )
}
