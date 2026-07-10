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
  if (imageUrl) {
    return (
      <img
        alt={restaurantName}
        className={cn('size-16 shrink-0 rounded-[5px] object-cover', className)}
        src={imageUrl}
      />
    )
  }
  // TODO: 추후 Default Image로 수정 예정
  return (
    <div
      aria-label={`${restaurantName} 이미지`}
      className={cn(
        'bg-secondary-200 flex size-16 shrink-0 items-center justify-center rounded-[5px]',
        className,
      )}
      role="img"
    >
      <span
        className={
          disabled ? 'typo-header-3 text-white/60' : 'typo-header-3 text-white'
        }
      >
        H
      </span>
    </div>
  )
}
