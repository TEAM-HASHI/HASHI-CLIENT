import { StarBlankIcon, StarFillIcon } from '@hashi/hds-icons'

import { ReservationCardImage } from '@/pages/myReservations/components/ReservationCardImage'
import type { VisitedReservation } from '@/pages/myReservations/types'

type VisitedReservationCardProps = {
  reservation: VisitedReservation
  onReviewPress: (reservation: VisitedReservation) => void
}

const MAX_RATING = 5

type RatingStarsProps = {
  rating?: number | null
  sizeClassName: string
  gapClassName?: string
}

const RatingStars = ({
  rating = 0,
  sizeClassName,
  gapClassName,
}: RatingStarsProps) => {
  const safeRating = rating ?? 0

  return (
    <span className={gapClassName ? `flex ${gapClassName}` : 'flex'}>
      {Array.from({ length: MAX_RATING }, (_, index) =>
        index < safeRating ? (
          <StarFillIcon
            key={index}
            className={`text-primary-400 shrink-0 ${sizeClassName}`}
          />
        ) : (
          <StarBlankIcon
            key={index}
            className={`text-warm-gray-300 shrink-0 ${sizeClassName}`}
          />
        ),
      )}
    </span>
  )
}

const ReviewAction = ({
  reservation,
  onReviewPress,
}: VisitedReservationCardProps) => {
  switch (reservation.reviewActionState) {
    case 'HIDDEN':
      return null
    case 'DELETED':
      return (
        <p className="typo-sub-header-2 border-warm-gray-100 text-warm-gray-300 mb-[21.5px] w-full rounded-[5px] border bg-white py-3.25 text-center">
          리뷰가 삭제된 예약입니다
        </p>
      )
    case 'WRITTEN':
      return (
        <button
          className="typo-sub-header-2 border-warm-gray-100 text-cool-gray-600 mb-[21.5px] w-full rounded-[5px] border bg-white py-3.25"
          onClick={() => onReviewPress(reservation)}
          type="button"
        >
          리뷰 작성 완료!{' '}
          <span className="text-primary-400">+{reservation.earnedPoint}P</span>
        </button>
      )
    case 'WRITABLE':
      return (
        <button
          className="border-secondary-200 flex w-full flex-col items-center border-t pt-1 pb-2"
          onClick={() => onReviewPress(reservation)}
          type="button"
        >
          <RatingStars gapClassName="gap-2.5" sizeClassName="size-7.25" />
          <span className="typo-body-7 text-cool-gray-700 mt-1">
            이 맛집 어떠셨나요?
          </span>
        </button>
      )
    case 'UNAVAILABLE':
      return (
        <button
          className="border-secondary-200 flex w-full flex-col items-center border-t pt-1 pb-2"
          disabled
          type="button"
        >
          <span className="typo-body-7 text-warm-gray-300 py-3.5">
            리뷰 작성이 어려운 예약이에요
          </span>
        </button>
      )
  }
}

export const VisitedReservationCard = ({
  reservation,
  onReviewPress,
}: VisitedReservationCardProps) => {
  const hasWrittenReview = reservation.reviewActionState === 'WRITTEN'

  return (
    <article className="border-warm-gray-50 border-b last:border-0">
      <div className="flex gap-3 py-3.5">
        <ReservationCardImage
          className="size-23"
          imageUrl={reservation.restaurantImageUrl}
          restaurantName={reservation.restaurantName}
        />
        <div className="min-w-0 pt-0.5">
          <h2 className="typo-sub-header-2 text-cool-gray-900 line-clamp-2">
            {reservation.restaurantName}
          </h2>
          <p className="typo-body-7 text-cool-gray-600 mt-2">
            {reservation.visitDateTime}
          </p>
          {hasWrittenReview ? (
            <div className="mt-0.5 flex items-center">
              <RatingStars
                rating={reservation.rating}
                sizeClassName="size-4.5"
              />
            </div>
          ) : (
            <p className="typo-body-7 text-cool-gray-600 mt-0.5">
              {reservation.guestSummary}
            </p>
          )}
        </div>
      </div>

      <ReviewAction reservation={reservation} onReviewPress={onReviewPress} />
    </article>
  )
}
