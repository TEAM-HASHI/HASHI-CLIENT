import { ImageFallback, type ImageFallbackMarkSize } from '@hashi/hds-ui'
import { useState, type ReactEventHandler } from 'react'

interface RestaurantImageProps {
  className: string
  markSize: ImageFallbackMarkSize
  src?: string
  onLoad?: ReactEventHandler<HTMLImageElement>
}

const RestaurantImageContent = ({
  className,
  markSize,
  src,
  onLoad,
}: RestaurantImageProps) => {
  const [hasError, setHasError] = useState(false)

  if (src && !hasError) {
    return (
      <img
        alt=""
        aria-hidden="true"
        className={className}
        onError={() => setHasError(true)}
        onLoad={onLoad}
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
