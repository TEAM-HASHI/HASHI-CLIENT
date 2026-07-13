import {
  ReviewHeader,
  ReviewReservationSummary,
} from '@/features/review/components'
import { Button } from '@hashi/hds-ui'
import { ReviewDeleteDialog } from '@/pages/reviewDetail/components/ReviewDeleteDialog'
import { ReviewDetailActionBar } from '@/pages/reviewDetail/components/ReviewDetailActionBar'
import { ReviewDetailContentCard } from '@/pages/reviewDetail/components/ReviewDetailContentCard'
import { useReviewDetailPage } from '@/pages/reviewDetail/hooks/useReviewDetailPage'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'

export const ReviewDetailPage = () => {
  const {
    isDeleteDialogOpen,
    isDeletePending,
    isError,
    isEditComingSoonDialogOpen,
    isInvalidReviewId,
    isPending,
    reviewDetail,
    handleBackClick,
    handleConfirmDeleteClick,
    handleDeleteClick,
    handleDeleteDialogOpenChange,
    handleEditComingSoonDialogOpenChange,
    handleEditClick,
    handleRetryClick,
  } = useReviewDetailPage()

  return (
    <section
      aria-label="리뷰 상세"
      className="min-h-dvh min-w-0 overflow-x-hidden bg-white pt-18.75 pb-[calc(111px+var(--safe-area-bottom,0px))]"
    >
      <div className="app-mobile-fixed-top z-fixed">
        <ReviewHeader title="리뷰 상세" onBackClick={handleBackClick} />
      </div>
      {isPending ? (
        <p className="typo-body-4 text-primary-200 flex min-h-[360px] items-center justify-center px-5 text-center">
          리뷰 정보를 불러오는 중입니다.
        </p>
      ) : isError || !reviewDetail ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 px-5 text-center">
          <p className="typo-body-4 text-primary-200">
            리뷰 정보를 불러오지 못했습니다.
          </p>
          <Button
            onClick={isInvalidReviewId ? handleBackClick : handleRetryClick}
            size="sm"
            variant="neutral"
          >
            {isInvalidReviewId ? '마이 리뷰로 돌아가기' : '다시 시도'}
          </Button>
        </div>
      ) : (
        <>
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
            isPending={isDeletePending}
            open={isDeleteDialogOpen}
            onConfirmDeleteClick={handleConfirmDeleteClick}
            onOpenChange={handleDeleteDialogOpenChange}
          />
          <ComingSoonDialog
            open={isEditComingSoonDialogOpen}
            onOpenChange={handleEditComingSoonDialogOpenChange}
          />
        </>
      )}
    </section>
  )
}
