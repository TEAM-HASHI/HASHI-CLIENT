import { useState } from 'react'

import { DefaultImage } from '@/shared/components/defaultImage'
import { cn } from '@/shared/utils'

type ReservationCardImageProps = {
  imageUrl?: string | null
  restaurantName: string
  disabled?: boolean
  className?: string
}

export const ReservationCardImage = ({
  imageUrl,
  restaurantName,
  disabled = false,
  className,
}: ReservationCardImageProps) => {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const shouldShowImage = imageUrl && failedImageUrl !== imageUrl

  if (shouldShowImage) {
    return (
      <img
        alt={restaurantName}
        className={cn('size-16 shrink-0 rounded-[5px] object-cover', className)}
        onError={() => {
          setFailedImageUrl(imageUrl)
        }}
        src={imageUrl}
      />
    )
  }

  return (
    <DefaultImage
      aria-label={`${restaurantName} 이미지`}
      className={cn(
        'size-16 shrink-0 rounded-[5px]',
        disabled && 'opacity-60',
        className,
      )}
      logoSize="sm"
      role="img"
    />
  )
}
