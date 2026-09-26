import { Button } from '@hashi/hds-ui'

import {
  InputReviewKeyword,
  InputReviewMain,
  InputReviewRate,
  ReviewHeader,
  ReviewReservationSummary,
  ReviewSubmitBar,
} from '@/features/review/components'
import { useReviewEditPage } from '@/pages/reviewEdit/hooks/useReviewEditPage'

export const ReviewEditPage = () => {
  const {
    isError,
    isInvalidReviewId,
    isPending,
    isSaveDisabled,
    maxReviewTextLength,
    photoFiles,
    photoUrls,
    rating,
    reviewEdit,
    reviewText,
    selectedKeywordIds,
    handleBackClick,
    handleInvalidReviewIdBackClick,
    handlePhotoFilesChange,
    handleRatingChange,
    handleRetryClick,
    handleReviewTextChange,
    handleSelectedKeywordIdsChange,
    setPhotoUrls,
  } = useReviewEditPage()

  const renderStatus = (
    message: string,
    actionLabel: string,
    onAction: () => void,
  ) => (
    <section
      aria-label="리뷰 수정"
      className="flex min-h-dvh w-full min-w-0 justify-center bg-white"
    >
      <div className="flex min-h-dvh w-full min-w-0 flex-col overflow-x-hidden bg-white">
        <div className="app-mobile-fixed-top z-fixed">
          <ReviewHeader title="리뷰 수정" onBackClick={handleBackClick} />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 pt-18.75 text-center">
          <p className="typo-body-4 text-primary-200">{message}</p>
          <Button size="sm" variant="neutral" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      </div>
    </section>
  )

  if (isPending) {
    return renderStatus(
      '리뷰 수정 정보를 불러오는 중입니다.',
      '이전으로',
      handleBackClick,
    )
  }

  if (isError || !reviewEdit) {
    return renderStatus(
      isInvalidReviewId
        ? '리뷰 수정 정보를 확인할 수 없습니다.'
        : '리뷰 수정 정보를 불러오지 못했습니다.',
      isInvalidReviewId ? '마이 리뷰로 돌아가기' : '다시 시도',
      isInvalidReviewId ? handleInvalidReviewIdBackClick : handleRetryClick,
    )
  }

  return (
    <section
      aria-label="리뷰 수정"
      className="flex min-h-dvh w-full min-w-0 justify-center bg-white"
    >
      <div className="flex min-h-dvh w-full min-w-0 flex-col overflow-x-hidden bg-white">
        <div className="app-mobile-fixed-top z-fixed">
          <ReviewHeader title="리뷰 수정" onBackClick={handleBackClick} />
        </div>
        <form
          aria-label="리뷰 수정 폼"
          className="flex min-h-0 min-w-0 flex-1 flex-col pt-18.75"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <ReviewReservationSummary
              density="comfortable"
              guestSummary={reviewEdit.guestSummary}
              restaurantName={reviewEdit.restaurantName}
              thumbnailSrc={reviewEdit.thumbnailSrc}
              visitedAt={reviewEdit.visitedAt}
            />
            <InputReviewRate
              value={rating}
              onValueChange={handleRatingChange}
            />
            <InputReviewKeyword
              selectedKeywordIds={selectedKeywordIds}
              onSelectedKeywordIdsChange={handleSelectedKeywordIdsChange}
            />
            <InputReviewMain
              maxLength={maxReviewTextLength}
              photoFiles={photoFiles}
              photoUrls={photoUrls}
              value={reviewText}
              onPhotoFilesChange={handlePhotoFilesChange}
              onPhotoUrlsChange={setPhotoUrls}
              onValueChange={handleReviewTextChange}
            />
          </div>
          <ReviewSubmitBar
            className="shrink-0 bg-white pb-12"
            disabled={isSaveDisabled}
            type="button"
          />
        </form>
      </div>
    </section>
  )
}
