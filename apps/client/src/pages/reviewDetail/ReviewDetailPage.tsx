import {
  ReviewHeader,
  ReviewReservationSummary,
} from '@/features/review/components'
import { ReviewDeleteDialog } from '@/pages/reviewDetail/components/ReviewDeleteDialog'
import { ReviewDetailActionBar } from '@/pages/reviewDetail/components/ReviewDetailActionBar'
import { ReviewDetailContentCard } from '@/pages/reviewDetail/components/ReviewDetailContentCard'
import { useReviewDetailPage } from '@/pages/reviewDetail/hooks/useReviewDetailPage'

export const ReviewDetailPage = () => {
  const {
    isDeleteDialogOpen,
    reviewDetail,
    handleBackClick,
    handleConfirmDeleteClick,
    handleDeleteClick,
    handleDeleteDialogOpenChange,
    handleEditClick,
  } = useReviewDetailPage()

  return (
    <section
      aria-label="리뷰 상세"
      className="min-h-dvh min-w-0 overflow-x-hidden bg-white pt-18.75 pb-[calc(111px+var(--safe-area-bottom,0px))]"
    >
      <div className="app-mobile-fixed-top z-fixed">
        <ReviewHeader title="리뷰 상세" onBackClick={handleBackClick} />
      </div>
      <ReviewReservationSummary
        restaurantName={reviewDetail.restaurantName}
        visitedAt={reviewDetail.visitedAt}
        guestSummary={reviewDetail.guestSummary}
        thumbnailSrc={reviewDetail.thumbnailSrc}
      />
      <ReviewDetailContentCard
        content={reviewDetail.content}
        images={reviewDetail.images}
        keywordIds={reviewDetail.keywordIds}
        rating={reviewDetail.rating}
        writtenDate={reviewDetail.writtenDate}
      />
      <ReviewDetailActionBar
        onDeleteClick={handleDeleteClick}
        onEditClick={handleEditClick}
      />
      <ReviewDeleteDialog
        open={isDeleteDialogOpen}
        onConfirmDeleteClick={handleConfirmDeleteClick}
        onOpenChange={handleDeleteDialogOpenChange}
      />
    </section>
  )
}
