import { useEffect, useState, type ComponentPropsWithoutRef } from 'react'

import { ImageFallback, type ImageFallbackMarkSize } from '../imageFallback'
import { cn } from '../../utils'

export type ThumbnailSize = 'sm' | 'md' | 'lg'

type ThumbnailSharedProps = Pick<
  ComponentPropsWithoutRef<'img'>,
  'aria-describedby' | 'aria-hidden' | 'className' | 'id' | 'title'
>

export interface ThumbnailProps extends ThumbnailSharedProps {
  alt: string
  onError?: ComponentPropsWithoutRef<'img'>['onError']
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
  'aria-describedby': ariaDescribedBy,
  'aria-hidden': ariaHidden,
  alt,
  className,
  id,
  onError,
  size = 'sm',
  src,
  title,
}: ThumbnailProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const sizeConfig = thumbnailSizeConfig[size]
  const thumbnailClassName = cn(
    'shrink-0 rounded-[5px]',
    sizeConfig.className,
    className,
  )

  useEffect(() => {
    setFailedSrc(null)
  }, [src])

  if (!src || failedSrc === src) {
    return (
      <ImageFallback
        aria-describedby={ariaDescribedBy}
        aria-hidden={ariaHidden ?? (alt === '' ? true : undefined)}
        aria-label={alt || undefined}
        className={thumbnailClassName}
        id={id}
        markSize={sizeConfig.markSize}
        role={alt ? 'img' : undefined}
        title={title}
      />
    )
  }

  return (
    <img
      aria-describedby={ariaDescribedBy}
      aria-hidden={ariaHidden}
      alt={alt}
      className={cn(thumbnailClassName, 'object-cover')}
      data-slot="thumbnail-image"
      id={id}
      onError={(event) => {
        setFailedSrc(src)
        onError?.(event)
      }}
      src={src}
      title={title}
    />
  )
}
