import { useNavigate } from 'react-router-dom'

import {
  InputReviewKeyword,
  InputReviewMain,
  InputReviewRate,
  ReviewHeader,
  ReviewReservationSummary,
  ReviewSubmitBar,
} from '@/features/review/components'
import { useReviewForm } from '@/features/review/hooks'

import { REVIEW_RESERVATION_SUMMARY } from './constants/reviewNewMockData'

export const ReviewNewPage = () => {
  const navigate = useNavigate()
  const {
    canSubmitReview,
    handlePhotoFilesChange,
    handleRatingChange,
    handleReviewTextChange,
    handleSelectedKeywordIdsChange,
    handleSubmit,
    maxReviewTextLength,
    photoFiles,
    rating,
    reviewText,
    selectedKeywordIds,
  } = useReviewForm()

  return (
    <main
      aria-label="리뷰 작성"
      className="flex min-h-dvh w-full justify-center bg-white"
    >
      <div className="flex min-h-dvh w-full max-w-[393px] flex-col bg-white">
        <ReviewHeader onBackClick={() => navigate(-1)} />
        <form
          aria-label="리뷰 작성 폼"
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <ReviewReservationSummary {...REVIEW_RESERVATION_SUMMARY} />
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
              value={reviewText}
              onPhotoFilesChange={handlePhotoFilesChange}
              onValueChange={handleReviewTextChange}
            />
          </div>
          <ReviewSubmitBar
            className="shrink-0 bg-white pb-12"
            disabled={!canSubmitReview}
            type="submit"
          />
        </form>
      </div>
    </main>
  )
}
