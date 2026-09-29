import { Thumbnail } from '@hashi/hds-ui'

interface ReservationRestaurantSummaryProps {
  name: string
  imageUrl?: string | null
}

export const ReservationRestaurantSummary = ({
  name,
  imageUrl,
}: ReservationRestaurantSummaryProps) => {
  return (
    <section
      aria-label="예약 식당 정보"
      className="flex w-full items-center gap-[9px] pr-5"
    >
      <Thumbnail alt={`${name} 식당 이미지`} size="sm" src={imageUrl} />
      <p className="typo-sub-header-1 text-primary-200 line-clamp-2 min-w-0 flex-1 break-keep">
        {name}
      </p>
    </section>
  )
}
