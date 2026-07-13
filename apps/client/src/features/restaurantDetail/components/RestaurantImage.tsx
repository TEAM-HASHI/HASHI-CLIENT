import { useState } from 'react'

import {
  DefaultImage,
  type DefaultImageLogoSize,
} from '@/shared/components/defaultImage'

interface RestaurantImageProps {
  alt?: string
  className: string
  defaultImageTestId: string
  logoSize: DefaultImageLogoSize
  src?: string
}

const RestaurantImageContent = ({
  alt = '',
  className,
  defaultImageTestId,
  logoSize,
  src,
}: RestaurantImageProps) => {
  const [hasError, setHasError] = useState(false)

  if (src && !hasError) {
    return (
      <img
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
        src={src}
      />
    )
  }

  return (
    <DefaultImage
      aria-hidden="true"
      className={className}
      data-testid={defaultImageTestId}
      logoSize={logoSize}
    />
  )
}

export const RestaurantImage = (props: RestaurantImageProps) => {
  return <RestaurantImageContent key={props.src ?? 'fallback'} {...props} />
}
