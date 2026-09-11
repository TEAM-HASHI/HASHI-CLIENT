import { ImageFallback, type ImageFallbackMarkSize } from '@hashi/hds-ui'
import { useState } from 'react'

interface RestaurantImageProps {
  className: string
  markSize: ImageFallbackMarkSize
  src?: string
}

export const RestaurantImage = ({
  className,
  markSize,
  src,
}: RestaurantImageProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (src && failedSrc !== src) {
    return (
      <img
        alt=""
        aria-hidden="true"
        className={className}
        onError={() => setFailedSrc(src)}
        src={src}
      />
    )
  }

  return (
    <ImageFallback
      aria-hidden="true"
      className={className}
      markSize={markSize}
    />
  )
}
