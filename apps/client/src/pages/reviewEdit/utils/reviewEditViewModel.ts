import type { MyReviewDetailData } from '@/features/review/api/getMyReviewDetail'
import {
  getReviewKeywordByValue,
  REVIEW_PHOTO_MAX_COUNT,
  type ReviewKeywordId,
} from '@/features/review/constants'

export interface ReviewEditViewModel {
  guestSummary: string
  photoUrls: string[]
  rating: number
  restaurantName: string
  reviewText: string
  selectedKeywordIds: ReviewKeywordId[]
  thumbnailSrc?: string
  visitedAt: string
}

const timeZoneSuffixPattern = /(Z|[+-]\d{2}:\d{2})$/

const parseKoreanDateTime = (value: string) =>
  new Date(timeZoneSuffixPattern.test(value) ? value : `${value}+09:00`)

const formatVisitedAt = (value: string | undefined) => {
  if (!value) {
    return '방문 일시 정보 없음'
  }

  const date = parseKoreanDateTime(value)

  if (Number.isNaN(date.getTime())) {
    return '방문 일시 정보 없음'
  }

  const parts = new Intl.DateTimeFormat('ko-KR', {
    day: 'numeric',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: 'numeric',
    timeZone: 'Asia/Seoul',
    year: 'numeric',
  }).formatToParts(date)
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return `${getPart('year')}. ${getPart('month')}. ${getPart('day')} ${getPart('hour')}:${getPart('minute')} 방문`
}

const formatGuestSummary = ({
  adultCount = 0,
  childCount = 0,
}: MyReviewDetailData) => {
  const guests = [
    adultCount > 0 ? `어른 ${adultCount}명` : null,
    childCount > 0 ? `어린이 ${childCount}명` : null,
  ].filter((guest): guest is string => guest !== null)

  return guests.length > 0 ? guests.join(' · ') : '인원 정보 없음'
}

const toSelectedKeywordIds = (keywords: string[] | undefined) =>
  Array.from(
    new Set(
      (keywords ?? []).flatMap((keyword) => {
        const reviewKeyword = getReviewKeywordByValue(keyword)

        return reviewKeyword ? [reviewKeyword.id] : []
      }),
    ),
  ).slice(0, 3)

export const toReviewEditViewModel = (
  data: MyReviewDetailData,
): ReviewEditViewModel => {
  const restaurantName = data.restaurantName ?? '식당 정보 없음'

  return {
    guestSummary: formatGuestSummary(data),
    photoUrls: (data.imageUrls ?? []).slice(0, REVIEW_PHOTO_MAX_COUNT),
    rating: data.rating ?? 0,
    restaurantName,
    reviewText: data.content ?? '',
    selectedKeywordIds: toSelectedKeywordIds(data.keywords),
    thumbnailSrc: data.restaurantThumbnailUrl,
    visitedAt: formatVisitedAt(data.visitedAt),
  }
}
