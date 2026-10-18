import { SaveBlankIcon, SaveIcon } from '@hashi/hds-icons'
import { Button, IconButton } from '@hashi/hds-ui'

import type { RestaurantDetailVariant } from '@/features/restaurantDetail/types/restaurantDetail'
import { BottomActionBar } from '@/shared/components/bottomActionBar'

interface RestaurantBottomBarProps {
  likeCount: string
  saved?: boolean
  variant: RestaurantDetailVariant
  onPressLike: () => void
  onPressRecommendAgain?: () => void
  onPressReservation: () => void
}

export const RestaurantBottomBar = ({
  likeCount,
  saved,
  variant,
  onPressLike,
  onPressRecommendAgain,
  onPressReservation,
}: RestaurantBottomBarProps) => {
  const isToday = variant === 'today'

  return (
    <BottomActionBar
      aria-label="식당 상세 액션"
      layout="compact"
      leadingAction={
        <div className="text-primary-200 flex w-9 shrink-0 flex-col items-center">
          <IconButton
            aria-label="저장하기"
            aria-pressed={saved}
            onClick={onPressLike}
            size="sm"
          >
            {saved ? (
              <SaveIcon className="text-warm-gray-100 size-9" />
            ) : (
              <SaveBlankIcon className="text-warm-gray-100 size-9" />
            )}
          </IconButton>
          <span className="typo-caption-3">{likeCount}</span>
        </div>
      }
      startAction={
        isToday ? (
          <Button
            onClick={onPressRecommendAgain}
            size="lg"
            variant="neutral"
            width="full"
          >
            다시 추천 받기
          </Button>
        ) : undefined
      }
      endAction={
        <Button onClick={onPressReservation} size="lg" width="full">
          예약하기
        </Button>
      }
    />
  )
}
