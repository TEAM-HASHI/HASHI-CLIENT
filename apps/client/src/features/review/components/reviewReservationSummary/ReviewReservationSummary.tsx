import type { ComponentPropsWithoutRef } from 'react'
import { Thumbnail } from '@hashi/hds-ui'

import { cn } from '@/shared/utils'

export type ReviewReservationSummaryDensity = 'comfortable' | 'compact'

export interface ReviewReservationSummaryProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'children'
> {
  density?: ReviewReservationSummaryDensity
  restaurantName: string
  visitedAt: string
  guestSummary: string
  thumbnailSrc?: string
}

export const ReviewReservationSummary = ({
  density = 'comfortable',
  restaurantName,
  visitedAt,
  guestSummary,
  thumbnailSrc,
  className,
  'aria-label': ariaLabel = '리뷰 대상 예약 정보',
  ...props
}: ReviewReservationSummaryProps) => {
  const thumbnailLabel = `${restaurantName} 대표 이미지`

  return (
    <section
      {...props}
      aria-label={ariaLabel}
      className={cn('flex w-full flex-col items-start px-5', className)}
    >
      <div
        className={cn(
          'border-warm-gray-50 flex w-full items-center gap-3 border-b',
          density === 'compact' ? 'h-[116px] py-3' : 'h-30',
        )}
      >
        <Thumbnail alt={thumbnailLabel} size="md" src={thumbnailSrc} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="typo-sub-header-2 text-cool-gray-900 line-clamp-2 w-full break-words">
            {restaurantName}
          </p>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="typo-body-7 text-cool-gray-600 truncate">
              {visitedAt}
            </p>
            <p className="typo-body-7 text-cool-gray-600 truncate">
              {guestSummary}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
