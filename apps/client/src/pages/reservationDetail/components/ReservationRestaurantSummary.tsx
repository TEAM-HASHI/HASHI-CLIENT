import { DefaultImage } from '@/shared/components/defaultImage'

export type ReservationRestaurantSummaryProps = {
  requestedDate: string
  requestedLabel: string
  restaurant: {
    name: string
    localName: string
    imageSrc?: string
  }
}

export const ReservationRestaurantSummary = ({
  requestedDate,
  requestedLabel,
  restaurant,
}: ReservationRestaurantSummaryProps) => {
  return (
    <>
      <h2 className="typo-body-3 mb-4">
        <time className="text-primary-200">{requestedDate}</time>{' '}
        <span className="text-cool-gray-900">{requestedLabel}</span>
      </h2>

      <div className="mb-6 flex gap-3">
        {restaurant.imageSrc ? (
          <img
            alt=""
            className="size-17 shrink-0 rounded-[5px] object-cover"
            src={restaurant.imageSrc}
          />
        ) : (
          <DefaultImage
            className="size-17 shrink-0 rounded-[5px]"
            logoSize="sm"
          />
        )}

        <div className="min-w-0">
          <p className="typo-sub-header-1 text-cool-gray-900 line-clamp-2">
            {restaurant.name}
          </p>
          <p className="typo-body-3 text-primary-200 mt-1 line-clamp-1">
            {restaurant.localName}
          </p>
        </div>
      </div>
    </>
  )
}
