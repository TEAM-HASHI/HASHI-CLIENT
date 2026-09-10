import { useState, type ComponentPropsWithoutRef } from 'react'

import { ImageFallback, type ImageFallbackMarkSize } from '../imageFallback'
import { cn } from '../../utils'

export type ThumbnailSize = 'sm' | 'md' | 'lg'

export interface ThumbnailProps extends Omit<
  ComponentPropsWithoutRef<'img'>,
  'alt' | 'src'
> {
  alt: string
  size?: ThumbnailSize
  src?: string | null
}

const thumbnailSizeConfig = {
  sm: { className: 'size-15', markSize: 'sm' },
  md: { className: 'size-23', markSize: 'sm' },
  lg: { className: 'size-33.75', markSize: 'md' },
} satisfies Record<
  ThumbnailSize,
  { className: string; markSize: ImageFallbackMarkSize }
>

export const Thumbnail = ({
  alt,
  className,
  onError,
  size = 'sm',
  src,
  ...props
}: ThumbnailProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const sizeConfig = thumbnailSizeConfig[size]
  const thumbnailClassName = cn(
    'shrink-0 rounded-[5px]',
    sizeConfig.className,
    className,
  )

  if (!src || failedSrc === src) {
    return (
      <ImageFallback
        aria-hidden={alt === '' ? 'true' : undefined}
        aria-label={alt || undefined}
        className={thumbnailClassName}
        id={props.id}
        markSize={sizeConfig.markSize}
        role={alt ? 'img' : undefined}
      />
    )
  }

  return (
    <img
      {...props}
      alt={alt}
      className={cn(thumbnailClassName, 'object-cover')}
      data-slot="thumbnail-image"
      onError={(event) => {
        setFailedSrc(src)
        onError?.(event)
      }}
      src={src}
    />
  )
}
