import { ImageFallback, type ImageFallbackMarkSize } from '@hashi/hds-ui'
import { useState } from 'react'

interface RestaurantImageProps {
  className: string
  markSize: ImageFallbackMarkSize
  src?: string
}

const RestaurantImageContent = ({
  className,
  markSize,
  src,
}: RestaurantImageProps) => {
  const [hasError, setHasError] = useState(false)

  if (src && !hasError) {
    return (
      <img
        alt=""
        aria-hidden="true"
        className={className}
        onError={() => setHasError(true)}
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

export const RestaurantImage = (props: RestaurantImageProps) => (
  <RestaurantImageContent key={props.src} {...props} />
)
