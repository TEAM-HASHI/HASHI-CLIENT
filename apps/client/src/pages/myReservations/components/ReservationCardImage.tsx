import { useState } from 'react'
import { ImageFallback } from '@hashi/hds-ui'

import { cn } from '@/shared/utils'

type ReservationCardImageProps = {
  imageUrl?: string | null
  restaurantName: string
  disabled?: boolean
  className?: string
}

const ReservationCardImageContent = ({
  imageUrl,
  restaurantName,
  disabled = false,
  className,
}: ReservationCardImageProps) => {
  const [hasError, setHasError] = useState(false)

  if (imageUrl && !hasError) {
    return (
      <img
        alt={restaurantName}
        className={cn('size-16 shrink-0 rounded-[5px] object-cover', className)}
        onError={() => setHasError(true)}
        src={imageUrl}
      />
    )
  }

  return (
    <ImageFallback
      aria-label={`${restaurantName} 이미지`}
      className={cn(
        'size-16 shrink-0 rounded-[5px]',
        disabled && 'opacity-60',
        className,
      )}
      markSize="sm"
      role="img"
    />
  )
}

export const ReservationCardImage = (props: ReservationCardImageProps) => {
  return <ReservationCardImageContent key={props.imageUrl} {...props} />
}
