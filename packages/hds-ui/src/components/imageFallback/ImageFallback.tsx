import { HashiMarkIcon } from '@hashi/hds-icons'
import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '../../utils'

export type ImageFallbackMarkSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ImageFallbackProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'children'
> {
  markSize?: ImageFallbackMarkSize
}

const markSizeClassName: Record<ImageFallbackMarkSize, string> = {
  sm: 'h-7',
  md: 'h-10',
  lg: 'h-13',
  xl: 'h-22',
}

export const ImageFallback = ({
  className,
  markSize = 'xl',
  ...props
}: ImageFallbackProps) => {
  return (
    <div
      className={cn(
        'bg-warm-gray-50 flex items-center justify-center overflow-hidden',
        className,
      )}
      data-slot="image-fallback"
      {...props}
    >
      <HashiMarkIcon
        aria-hidden="true"
        className={cn(
          'text-primary-100 w-auto shrink-0',
          markSizeClassName[markSize],
        )}
      />
    </div>
  )
}
