import { useState, type ComponentPropsWithoutRef } from 'react'

import {
  DefaultImage,
  type DefaultImageLogoSize,
} from '@/shared/components/defaultImage/DefaultImage'

export type ImageWithDefaultFallbackProps = Omit<
  ComponentPropsWithoutRef<'img'>,
  'src'
> & {
  src?: string
  fallbackLogoSize?: DefaultImageLogoSize
}

const ImageWithDefaultFallbackInner = ({
  src,
  className,
  fallbackLogoSize = 'sm',
  ...props
}: ImageWithDefaultFallbackProps) => {
  const [hasError, setHasError] = useState(false)

  if (src && !hasError) {
    return (
      <img
        className={className}
        src={src}
        {...props}
        onError={(event) => {
          props.onError?.(event)
          setHasError(true)
        }}
      />
    )
  }

  return (
    <DefaultImage
      aria-hidden={props.alt === '' ? 'true' : undefined}
      aria-label={props.alt === '' ? undefined : props.alt}
      className={className}
      logoSize={fallbackLogoSize}
    />
  )
}

export const ImageWithDefaultFallback = (
  props: ImageWithDefaultFallbackProps,
) => {
  return (
    <ImageWithDefaultFallbackInner key={props.src ?? 'fallback'} {...props} />
  )
}
