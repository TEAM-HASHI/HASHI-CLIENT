import { StarBlankIcon, StarFillIcon } from '@hashi/hds-icons'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '../../utils'

const starRatingVariants = cva('inline-flex items-center', {
  variants: {
    size: {
      sm: 'gap-1',
      md: 'gap-2',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const starItemVariants = cva('relative inline-flex shrink-0', {
  variants: {
    size: {
      sm: 'size-[18px]',
      md: 'size-9',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const starIconVariants = cva('absolute inset-0 size-full', {
  variants: {
    state: {
      filled: 'text-primary-500',
      empty: 'text-warm-gray-300',
    },
  },
})

type StarRatingVariantProps = VariantProps<typeof starRatingVariants>
type StarState = 'filled' | 'half' | 'empty'

export type StarRatingSize = NonNullable<StarRatingVariantProps['size']>

export type StarRatingProps = Omit<
  ComponentPropsWithoutRef<'span'>,
  'aria-label' | 'children' | 'role'
> & {
  'aria-label'?: string
  className?: string
  size?: StarRatingSize
  value: number
}

const STAR_COUNT = 5

const getDisplayValue = (value: number) => {
  if (Number.isInteger(value)) {
    return value
  }

  return Math.floor(value) + 0.5
}

const getStarState = (index: number, displayValue: number): StarState => {
  const starValue = index + 1

  if (displayValue >= starValue) {
    return 'filled'
  }

  if (displayValue >= starValue - 0.5) {
    return 'half'
  }

  return 'empty'
}

const StarItem = ({
  size,
  state,
}: {
  size?: StarRatingSize
  state: StarState
}) => (
  <span
    aria-hidden="true"
    className={cn(starItemVariants({ size }))}
    data-state={state}
    data-testid="star-rating-item"
  >
    <StarBlankIcon
      aria-hidden="true"
      className={cn(starIconVariants({ state: 'empty' }))}
    />
    {state === 'filled' ? (
      <StarFillIcon
        aria-hidden="true"
        className={cn(starIconVariants({ state: 'filled' }))}
      />
    ) : state === 'half' ? (
      <span className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
        <StarFillIcon
          aria-hidden="true"
          className={cn(
            starIconVariants({ state: 'filled' }),
            'w-[200%] max-w-none',
          )}
        />
      </span>
    ) : null}
  </span>
)

export const StarRating = ({
  'aria-label': ariaLabel,
  className,
  size,
  value,
  ...props
}: StarRatingProps) => {
  const displayValue = getDisplayValue(value)

  return (
    <span
      {...props}
      aria-label={ariaLabel ?? `평점 ${value}점`}
      className={cn(starRatingVariants({ size }), className)}
      role="img"
    >
      {Array.from({ length: STAR_COUNT }, (_, index) => (
        <StarItem
          key={index}
          size={size}
          state={getStarState(index, displayValue)}
        />
      ))}
    </span>
  )
}
