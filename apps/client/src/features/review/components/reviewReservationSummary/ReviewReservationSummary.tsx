import type { ComponentPropsWithoutRef } from 'react'

import { DefaultImage } from '@/shared/components/defaultImage'
import { cn } from '@/shared/utils'

export interface ReviewReservationSummaryProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'children'
> {
  restaurantName: string
  visitedAt: string
  guestSummary: string
  thumbnailSrc?: string
}

export const ReviewReservationSummary = ({
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
      <div className="border-warm-gray-50 flex h-30 w-full items-center gap-3 border-b">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={thumbnailLabel}
            className="size-23 shrink-0 rounded-[5px] object-cover"
          />
        ) : (
          <DefaultImage
            role="img"
            aria-label={thumbnailLabel}
            className="size-23 shrink-0 rounded-[5px]"
            data-slot="thumbnail-default-image"
            logoSize="sm"
          />
        )}
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
