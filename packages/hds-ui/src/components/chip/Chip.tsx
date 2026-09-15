import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cva } from 'class-variance-authority'

import { cn } from '../../utils'

type ChipBaseButtonProps = Omit<
  ComponentPropsWithoutRef<'button'>,
  'aria-pressed' | 'children' | 'onClick' | 'type'
>

type ChipBasicProps = Omit<
  ChipBaseButtonProps,
  'aria-disabled' | 'disabled'
> & {
  children: string
  count?: ReactNode
  disabledIcon?: never
  icon?: never
  onSelectedChange?: (selected: boolean) => void
  selected?: boolean
  variant?: 'basic'
}

type ChipIconProps = ChipBaseButtonProps & {
  children: string
  count?: never
  disabledIcon?: ReactNode
  icon: ReactNode
  onSelectedChange?: (selected: boolean) => void
  selected?: boolean
  variant: 'icon'
}

export type ChipProps = ChipBasicProps | ChipIconProps

const basicChipVariants = cva(
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

const basicChipLabelVariants = cva(
  'typo-body-6 min-w-0 truncate leading-[1.36] whitespace-nowrap',
)

const basicChipCountVariants = cva(
  'typo-caption-1 shrink-0 leading-[1.5] whitespace-nowrap',
)

const iconChipVariants = cva(
  'inline-flex h-9 max-w-full shrink-0 cursor-pointer appearance-none items-center justify-center gap-1 rounded-[5px] border px-2.5 py-1 font-sans text-black transition-colors focus-visible:outline-cool-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:border-warm-gray-100 disabled:bg-primary-100 disabled:text-warm-gray-300',
  {
    variants: {
      selected: {
        true: 'border-[1.4px] border-primary-400 bg-primary-400/20 enabled:hover:bg-primary-400/30 enabled:active:bg-primary-400/50',
        false:
          'border-warm-gray-100 bg-white enabled:hover:bg-primary-100 enabled:active:bg-primary-400/20',
      },
    },
  },
)

const iconChipLabelVariants = cva(
  'typo-body-8 min-w-0 truncate whitespace-nowrap',
)

const ChipIconSlot = ({ icon }: { icon: ReactNode }) => {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center text-2xl"
    >
      {icon}
    </span>
  )
}

type ChipRootProps = ChipBaseButtonProps & {
  children: ReactNode
  onSelectedChange?: (selected: boolean) => void
  selected?: boolean
}

const ChipRoot = ({
  children,
  onSelectedChange,
  selected = false,
  ...buttonProps
}: ChipRootProps) => {
  const handleClick = () => {
    onSelectedChange?.(!selected)
  }

  return (
    <button
      {...buttonProps}
      aria-pressed={selected}
      onClick={handleClick}
      type="button"
    >
      {children}
    </button>
  )
}

const BasicChip = ({
  children,
  className,
  count,
  onSelectedChange,
  selected = false,
  variant: _variant,
  ...buttonProps
}: ChipBasicProps) => {
  void _variant

  return (
    <ChipRoot
      {...buttonProps}
      className={cn(basicChipVariants({ selected }), className)}
      selected={selected}
      onSelectedChange={onSelectedChange}
    >
      <span className={cn(basicChipLabelVariants())}>{children}</span>
      {count !== undefined && count !== null ? (
        <span className={cn(basicChipCountVariants())}>{count}</span>
      ) : null}
    </ChipRoot>
  )
}

const IconChip = ({
  children,
  className,
  disabled = false,
  disabledIcon,
  icon,
  onSelectedChange,
  selected = false,
  variant: _variant,
  ...buttonProps
}: ChipIconProps) => {
  void _variant

  const displayIcon = disabled && disabledIcon ? disabledIcon : icon

  return (
    <ChipRoot
      {...buttonProps}
      className={cn(iconChipVariants({ selected }), className)}
      disabled={disabled}
      selected={selected}
      onSelectedChange={onSelectedChange}
    >
      <ChipIconSlot icon={displayIcon} />
      <span className={cn(iconChipLabelVariants())}>{children}</span>
    </ChipRoot>
  )
}

export const Chip = (props: ChipProps) => {
  if (props.variant === 'icon') {
    return <IconChip {...props} />
  }

  return <BasicChip {...props} />
}
