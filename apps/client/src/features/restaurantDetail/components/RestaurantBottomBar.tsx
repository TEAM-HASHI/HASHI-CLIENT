import { HeartBlankIcon } from '@hashi/hds-icons'
import { Button, IconButton } from '@hashi/hds-ui'

import type { RestaurantDetailVariant } from '@/features/restaurantDetail/types/restaurantDetail'

interface RestaurantBottomBarProps {
  likeCount: string
  variant: RestaurantDetailVariant
  onPressLike: () => void
  onPressRecommendAgain?: () => void
  onPressReservation: () => void
}

export const RestaurantBottomBar = ({
  likeCount,
  variant,
  onPressLike,
  onPressRecommendAgain,
  onPressReservation,
}: RestaurantBottomBarProps) => {
  const isToday = variant === 'today'

  return (
    <div className="app-mobile-fixed-bottom z-20 bg-white px-5 pt-4 pb-[calc(17px+var(--safe-area-bottom,0px))]">
      <div className="flex h-[49px] items-center gap-[17px]">
        <div className="text-primary-200 flex w-9 shrink-0 flex-col items-center gap-1">
          <IconButton aria-label="좋아요" onClick={onPressLike} size="xs">
            <HeartBlankIcon className="size-7" />
          </IconButton>
          <span className="typo-caption-3">{likeCount}</span>
        </div>
        <div className="flex min-w-0 flex-1 gap-4">
          {isToday ? (
            <Button
              onClick={onPressRecommendAgain}
              size="lg"
              variant="neutral"
              width="full"
            >
              다시 추천 받기
            </Button>
          ) : null}
          <Button onClick={onPressReservation} size="lg" width="full">
            예약하기
          </Button>
        </div>
      </div>
    </div>
  )
}
