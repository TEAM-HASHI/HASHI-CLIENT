interface ReservationRequestInfoSectionProps {
  restaurantName: string
  restaurantImageUrl?: string | null
  guestName: string
  guestText: string
  restaurantAddress: string
  visitDateTime: string
}

const ReservationInfoRow = ({
  label,
  value,
  multiline = false,
}: {
  label: string
  value: string
  multiline?: boolean
}) => {
  return (
    <div className="flex items-start justify-between gap-5">
      <dt className="typo-sub-header-3 text-cool-gray-900 shrink-0">
        {label}
      </dt>
      <dd
        className={
          multiline
            ? 'typo-body-6 text-cool-gray-900 max-w-[149px] text-right leading-[1.36] break-keep'
            : 'typo-body-6 text-cool-gray-900 text-right leading-[1.36] whitespace-nowrap'
        }
      >
        {value}
      </dd>
    </div>
  )
}

export const ReservationRequestInfoSection = ({
  restaurantName,
  restaurantImageUrl,
  guestName,
  guestText,
  restaurantAddress,
  visitDateTime,
}: ReservationRequestInfoSectionProps) => {
  return (
    <section aria-label="예약 정보 확인" className="pt-6.5">
      <div className="px-5 pb-[45px]">
        <div className="flex items-center gap-[9px] pl-[3.5px]">
          {restaurantImageUrl ? (
            <img
              alt={`${restaurantName} 식당 이미지`}
              className="size-[60px] shrink-0 rounded-[5px] object-cover"
              src={restaurantImageUrl}
            />
          ) : (
            <div
              aria-hidden="true"
              className="bg-secondary-200 size-[60px] shrink-0 rounded-[5px]"
            />
          )}
          <p className="typo-sub-header-1 text-primary-200 line-clamp-2 min-w-0 flex-1 break-keep">
            {restaurantName}
          </p>
        </div>

        <dl className="mt-[45px] flex flex-col gap-5 px-[5.5px]">
          <ReservationInfoRow label="예약자" value={guestName} />
          <ReservationInfoRow label="인원" value={guestText} />
          <ReservationInfoRow
            label="식당 주소"
            multiline
            value={restaurantAddress}
          />
          <ReservationInfoRow label="식당 방문 일정" value={visitDateTime} />
        </dl>
      </div>

      <div aria-hidden="true" className="bg-warm-gray-50 h-2 w-full" />
    </section>
  )
}
