import type { ComponentPropsWithoutRef } from 'react'

import defaultLogo from '@/shared/assets/logos/default-logo.svg'
import { cn } from '@/shared/utils'

const logoSizeClassName = {
  sm: 'h-7',
  md: 'h-10',
  lg: 'h-13',
} as const

export type DefaultImageLogoSize = keyof typeof logoSizeClassName

export type DefaultImageProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children'
> & {
  logoSize?: DefaultImageLogoSize
}

export const DefaultImage = ({
  logoSize = 'md',
  className,
  ...props
}: DefaultImageProps) => {
  return (
    <div
      className={cn(
        'bg-warm-gray-100 flex items-center justify-center overflow-hidden',
        className,
      )}
      {...props}
    >
      <img
        alt=""
        className={cn('w-auto', logoSizeClassName[logoSize])}
        src={defaultLogo}
      />
    </div>
  )
}
