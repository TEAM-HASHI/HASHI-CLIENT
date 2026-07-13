import {
  REVIEW_KEYWORDS,
  type ReviewKeywordId,
} from '@/features/review/constants'
import type { MyReviewDetailData } from '@/pages/reviewDetail/api/getMyReviewDetail'
import type { ReviewDetail } from '@/pages/reviewDetail/types'

const keywordIdByLabel = new Map<string, ReviewKeywordId>([
  ...REVIEW_KEYWORDS.map(
    ({ id, label }) => [label, id] as [string, ReviewKeywordId],
  ),
  ['직원분이 친절해요', 'kind'],
])

const timeZoneSuffixPattern = /(Z|[+-]\d{2}:\d{2})$/

const parseKoreanDateTime = (value: string) =>
  new Date(timeZoneSuffixPattern.test(value) ? value : `${value}+09:00`)

const getDateParts = (value: string | undefined) => {
  if (!value) {
    return null
  }

  const date = parseKoreanDateTime(value)

  if (Number.isNaN(date.getTime())) {
    return null
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

  return {
    day: getPart('day'),
    hour: getPart('hour'),
    minute: getPart('minute'),
    month: getPart('month'),
    year: getPart('year'),
  }
}

const formatVisitedAt = (value: string | undefined) => {
  const parts = getDateParts(value)

  return parts
    ? `${parts.year}. ${parts.month}. ${parts.day} ${parts.hour}:${parts.minute} 방문`
    : '방문 일시 정보 없음'
}

const formatWrittenDate = (value: string | undefined) => {
  const parts = getDateParts(value)

  return parts
    ? `${parts.year}.${parts.month.padStart(2, '0')}.${parts.day.padStart(2, '0')}`
    : ''
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

export const toReviewDetail = (data: MyReviewDetailData): ReviewDetail => {
  if (data.reviewId === undefined) {
    throw new Error('Missing review field: reviewId')
  }

  const restaurantName = data.restaurantName ?? '식당 정보 없음'

  return {
    content: data.content ?? '',
    guestSummary: formatGuestSummary(data),
    id: String(data.reviewId),
    images: (data.imageUrls ?? []).map((src, index) => ({
      alt: `${restaurantName} 리뷰 사진 ${index + 1}`,
      id: `review-${data.reviewId}-image-${index + 1}`,
      src,
    })),
    keywordIds: (data.keywords ?? []).flatMap((keyword) => {
      const id = keywordIdByLabel.get(keyword)

      return id ? [id] : []
    }),
    rating: data.rating ?? 0,
    restaurantName,
    thumbnailSrc: data.restaurantThumbnailUrl,
    visitedAt: formatVisitedAt(data.visitedAt),
    writtenDate: formatWrittenDate(data.createdAt),
  }
}
