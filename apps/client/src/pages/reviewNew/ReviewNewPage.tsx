import type { SyntheticEvent } from 'react'
import { useMemo } from 'react'
import { generatePath, useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  InputReviewKeyword,
  InputReviewMain,
  InputReviewRate,
  ReviewHeader,
  ReviewReservationSummary,
  ReviewSubmitBar,
} from '@/features/review/components'
import { getReviewKeywordIconByCode } from '@/features/review/constants'
import { useReviewForm } from '@/features/review/hooks'
import { useSubmitReviewMutation } from '@/pages/reviewNew/mutations/useSubmitReviewMutation'
import { useReviewContextQuery } from '@/pages/reviewNew/queries/useReviewContextQuery'
import {
  formatReviewGuestSummary,
  formatReviewVisitedAt,
} from '@/pages/reviewNew/utils/reviewContextView'

const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/

const parseReservationId = (reservationIdParam: string | null) => {
  if (
    !reservationIdParam ||
    !POSITIVE_INTEGER_PATTERN.test(reservationIdParam)
  ) {
    return null
  }

  const reservationId = Number(reservationIdParam)

  return Number.isSafeInteger(reservationId) ? reservationId : null
}

export const ReviewNewPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reservationId = parseReservationId(searchParams.get('reservationId'))
  const reviewContextQuery = useReviewContextQuery(reservationId)
  const submitReviewMutation = useSubmitReviewMutation()
  const {
    canSubmitReview,
    handlePhotoFilesChange,
    handleRatingChange,
    handleReviewTextChange,
    handleSelectedKeywordIdsChange,
    maxReviewTextLength,
    photoFiles,
    rating,
    reviewText,
    selectedKeywordIds,
  } = useReviewForm()

  const reviewContext = reviewContextQuery.data
  const keywordOptions = useMemo(
    () =>
      reviewContext?.reviewKeywordOptions
        ?.map(({ code, label }) => ({
          id: code ?? '',
          label: label ?? code ?? '',
          Icon: code ? getReviewKeywordIconByCode(code) : undefined,
        }))
        .filter(({ id, label }) => id.length > 0 && label.length > 0) ?? [],
    [reviewContext?.reviewKeywordOptions],
  )

  const renderStatus = (message: string) => (
    <section
      aria-label="리뷰 작성"
      className="flex min-h-dvh w-full min-w-0 justify-center bg-white"
    >
      <div className="flex min-h-dvh w-full min-w-0 flex-col overflow-x-hidden bg-white">
        <div className="app-mobile-fixed-top z-fixed">
          <ReviewHeader onBackClick={() => navigate(-1)} />
        </div>
        <div className="typo-body-4 text-cool-gray-700 flex flex-1 items-center justify-center px-5 pt-18.75 text-center">
          {message}
        </div>
      </div>
    </section>
  )

  if (reservationId === null) {
    return renderStatus('리뷰 작성 예약 정보를 확인할 수 없습니다.')
  }

  if (reviewContextQuery.isPending) {
    return renderStatus('리뷰 작성 정보를 불러오는 중입니다.')
  }

  if (reviewContextQuery.isError || !reviewContext) {
    return renderStatus('리뷰 작성 정보를 불러오지 못했습니다.')
  }

  const restaurantName = reviewContext.restaurantName ?? '식당 정보 없음'
  const isReviewSubmitDisabled =
    !canSubmitReview ||
    reviewContext.reviewable !== true ||
    submitReviewMutation.isPending

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isReviewSubmitDisabled) {
      return
    }

    submitReviewMutation.mutate(
      {
        reservationId,
        rating,
        keywordCodes: selectedKeywordIds,
        content: reviewText,
        photoFiles,
      },
      {
        onSuccess: ({ reviewId }) => {
          navigate(
            generatePath(ROUTES.reviewDetail, {
              reviewId: String(reviewId),
            }),
          )
        },
      },
    )
  }

  return (
    <section
      aria-label="리뷰 작성"
      className="flex min-h-dvh w-full min-w-0 justify-center bg-white"
    >
      <div className="flex min-h-dvh w-full min-w-0 flex-col overflow-x-hidden bg-white">
        <div className="app-mobile-fixed-top z-fixed">
          <ReviewHeader onBackClick={() => navigate(-1)} />
        </div>
        <form
          aria-label="리뷰 작성 폼"
          className="flex min-h-0 min-w-0 flex-1 flex-col pt-18.75"
          onSubmit={handleSubmit}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <ReviewReservationSummary
              guestSummary={formatReviewGuestSummary({
                adultCount: reviewContext.adultCount,
                teenCount: reviewContext.teenCount,
                childCount: reviewContext.childCount,
              })}
              restaurantName={restaurantName}
              thumbnailSrc={reviewContext.restaurantThumbnailUrl}
              visitedAt={formatReviewVisitedAt(reviewContext.visitedAt)}
            />
            <InputReviewRate
              value={rating}
              onValueChange={handleRatingChange}
            />
            <InputReviewKeyword
              keywordOptions={keywordOptions}
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
          {submitReviewMutation.isError ? (
            <p
              aria-label="리뷰 저장 실패"
              className="typo-body-7 text-error px-5 pt-3 text-center"
              role="alert"
            >
              리뷰를 저장하지 못했습니다. 다시 시도해주세요.
            </p>
          ) : null}
          <ReviewSubmitBar
            className="shrink-0 bg-white pb-12"
            disabled={isReviewSubmitDisabled}
            loading={submitReviewMutation.isPending}
            type="submit"
          />
        </form>
      </div>
    </section>
  )
}
