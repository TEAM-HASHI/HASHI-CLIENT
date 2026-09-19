import { useState } from 'react'
import { ImageFallback } from '@hashi/hds-ui'

export type ReservationRestaurantSummaryProps = {
  requestedDate: string
  requestedLabel: string
  restaurant: {
    name: string
    localName: string
    imageSrc?: string
  }
}

type RestaurantImageProps = {
  name: string
  src?: string
}

const RestaurantImageContent = ({ name, src }: RestaurantImageProps) => {
  const [hasError, setHasError] = useState(false)

  if (src && !hasError) {
    return (
      <img
        alt={name}
        className="size-17 shrink-0 rounded-[5px] object-cover"
        onError={() => setHasError(true)}
        src={src}
      />
    )
  }

  return (
    <ImageFallback
      aria-label={`${name} 이미지`}
      className="size-17 shrink-0 rounded-[5px]"
      markSize="sm"
      role="img"
    />
  )
}

const RestaurantImage = (props: RestaurantImageProps) => {
  return <RestaurantImageContent key={props.src} {...props} />
}

export const ReservationRestaurantSummary = ({
  requestedDate,
  requestedLabel,
  restaurant,
}: ReservationRestaurantSummaryProps) => {
  return (
    <>
      <h2 className="typo-body-3 text-cool-gray-600 mb-4">
        <time>{requestedDate}</time> <span>{requestedLabel}</span>
      </h2>

      <div className="mb-6 flex gap-3">
        <RestaurantImage name={restaurant.name} src={restaurant.imageSrc} />

        <div className="min-w-0">
          <p className="typo-sub-header-2 text-cool-gray-900 line-clamp-2">
            {restaurant.name}
          </p>
          <p className="typo-body-3 text-primary-200 mt-2 line-clamp-1">
            {restaurant.localName}
          </p>
        </div>
      </div>
    </>
  )
}
