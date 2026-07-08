import { Button } from '@hashi/hds-ui'

import { ReviewImagePlaceholder } from '@/pages/myReviews/components/ReviewImagePlaceholder'
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
    <article className="flex min-w-0 flex-col gap-3 pb-5">
      <div className="flex min-w-0 items-center gap-3 py-3.5">
        <ReviewImagePlaceholder />
        <div className="min-w-0 flex-1">
          <h2 className="typo-sub-header-2 text-cool-gray-900 line-clamp-2">
            {review.restaurantName}
          </h2>
          <p className="typo-body-7 text-cool-gray-500 mt-2">
            {review.visitedAt}
          </p>
          <p className="typo-body-7 text-cool-gray-500 mt-0.5">
            {review.guestSummary}
          </p>
        </div>
      </div>
      <Button className="h-9" onClick={onClick} size="sm" width="full">
        리뷰 작성
      </Button>
    </article>
  )
}
