import { StarBlankIcon, StarFillIcon } from '@hashi/hds-icons'
import type { ComponentPropsWithoutRef } from 'react'

import { REVIEW_RATING_VALUES } from '@/features/review/constants'
import { cn } from '@/shared/utils'

export interface InputReviewRateProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'children' | 'onChange'
> {
  value?: number
  onValueChange?: (value: number) => void
}

export const InputReviewRate = ({
  value = 0,
  onValueChange,
  className,
  ...props
}: InputReviewRateProps) => {
  return (
    <section
      {...props}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 pt-11 pb-7',
        className,
      )}
    >
      <p className="typo-sub-header-1 text-primary-200 w-full text-center break-words">
        이 맛집 어떠셨나요?
      </p>
      <div
        aria-label="맛집 별점 선택"
        className="flex items-center gap-[10px]"
        role="radiogroup"
      >
        {REVIEW_RATING_VALUES.map((rating) => {
          const isFilled = value >= rating
          const isChecked = value === rating

          return (
            <button
              key={rating}
              aria-checked={isChecked}
              aria-label={`${rating}점`}
              className="text-warm-gray-300 relative flex size-[29px] shrink-0 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2"
              data-state={isFilled ? 'selected' : 'empty'}
              role="radio"
              type="button"
              onClick={() => onValueChange?.(rating)}
            >
              <StarBlankIcon
                aria-hidden="true"
                className="text-warm-gray-300 absolute inset-0 size-full"
              />
              {isFilled ? (
                <StarFillIcon
                  aria-hidden="true"
                  className="text-primary-400 absolute inset-0 size-full"
                />
              ) : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}
