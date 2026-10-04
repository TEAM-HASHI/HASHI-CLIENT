import { Thumbnail } from '@hashi/hds-ui'

import type { WritableReview } from '@/pages/myReviews/types/myReview'

interface ReviewWritableCardProps {
  review: WritableReview
  onClick: () => void
}

export const ReviewWritableCard = ({
  review,
  onClick,
}: ReviewWritableCardProps) => {
  return (
    <article className="border-warm-gray-50 relative h-29 min-w-0 border-b py-3">
      <button
        aria-label={`${review.restaurantName} 리뷰 작성하기`}
        className="focus-visible:outline-cool-gray-500 absolute inset-0 rounded-[5px] focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={onClick}
        type="button"
      />
      <div className="pointer-events-none flex h-full min-w-0 items-start gap-3">
        <Thumbnail alt="" size="md" src={review.thumbnailUrl} />
        <div className="flex h-full min-w-0 flex-1 flex-col gap-2 pr-2.5">
          <div className="flex h-[38px] items-center">
            <h2 className="typo-sub-header-2 text-cool-gray-900 line-clamp-2">
              {review.restaurantName}
            </h2>
          </div>
          <div className="flex h-[46px] flex-col gap-0.5">
            <p className="typo-body-7 text-cool-gray-600">{review.visitedAt}</p>
            <p className="typo-body-7 text-cool-gray-600">
              {review.guestSummary}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
