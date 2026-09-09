import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '../../utils'

export type BannerProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'title'
> & {
  imageSrc: string
  imageAlt: string
  indicator?: ReactNode
} & (
    | { variant: 'withText'; title: string; subtitle: string }
    | { variant?: 'withoutText'; title?: never; subtitle?: never }
  )

export const Banner = ({
  imageSrc,
  imageAlt,
  variant = 'withoutText',
  title,
  subtitle,
  indicator,
  className,
  ...props
}: BannerProps) => {
  const isWithText = variant === 'withText'

  return (
    <div
      {...props}
      className={cn(
        'bg-cool-gray-100 relative aspect-[353/160] w-full overflow-hidden rounded-[5px]',
        className,
      )}
      data-hds-banner=""
      data-variant={variant}
    >
      <img alt={imageAlt} className="size-full object-cover" src={imageSrc} />
      {isWithText && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/0 to-black/50"
        />
      )}
      <div className="pointer-events-none absolute inset-x-5 bottom-4.5 flex min-w-0 flex-col gap-1 text-white">
        {isWithText && <p className="typo-header-1 truncate">{title}</p>}
        <div className="flex min-h-3.5 items-center justify-end gap-6">
          {isWithText && (
            <p className="typo-caption-1 min-w-0 flex-1 truncate font-medium">
              {subtitle}
            </p>
          )}
          {indicator}
        </div>
      </div>
    </div>
  )
}
