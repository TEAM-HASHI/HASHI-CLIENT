import {
  getReviewKeywordIcon,
  REVIEW_KEYWORDS,
  type ReviewKeywordId,
} from '@/features/review/constants'
import type { InputReviewKeywordOption } from '@/features/review/components/inputReviewKeyword/InputReviewKeyword'
import type {
  ReviewEditContextData,
  ValidReviewEditContextData,
} from '@/pages/reviewEdit/api/getReviewEditContext'

export interface ExistingReviewImage {
  fileKey: string
  imageUrl: string
}

export interface ReviewEditViewModel {
  guestSummary: string
  images: ExistingReviewImage[]
  keywordOptions: InputReviewKeywordOption[]
  rating: number
  restaurantId?: number
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
  teenCount = 0,
}: ReviewEditContextData) => {
  const guests = [
    adultCount > 0 ? `어른 ${adultCount}명` : null,
    teenCount > 0 ? `청소년 ${teenCount}명` : null,
    childCount > 0 ? `어린이 ${childCount}명` : null,
  ].filter((guest): guest is string => guest !== null)

  return guests.length > 0 ? guests.join(' · ') : '인원 정보 없음'
}

export const toReviewEditViewModel = (
  data: ValidReviewEditContextData,
): ReviewEditViewModel => {
  const restaurantName = data.restaurantName ?? '식당 정보 없음'
  const keywordOptions = data.reviewKeywordOptions?.length
    ? data.reviewKeywordOptions.flatMap(({ code, label }) =>
        code
          ? [
              {
                id: code,
                label: label ?? code,
                Icon: getReviewKeywordIcon({ code, label }),
              },
            ]
          : [],
      )
    : REVIEW_KEYWORDS.map(({ code, label, Icon }) => ({
        id: code,
        label,
        Icon,
      }))

  return {
    guestSummary: formatGuestSummary(data),
    images: data.images
      .slice()
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map(({ fileKey, imageUrl }) => ({
        fileKey,
        imageUrl,
      })),
    keywordOptions,
    rating: data.rating ?? 0,
    restaurantId: data.restaurantId,
    restaurantName,
    reviewText: data.content ?? '',
    selectedKeywordIds: Array.from(new Set(data.selectedKeywordCodes ?? [])),
    thumbnailSrc: data.restaurantThumbnailUrl,
    visitedAt: formatVisitedAt(data.visitedAt),
  }
}
