import {
  CameraIcon,
  CleanIcon,
  DeliciousIcon,
  FastIcon,
  LeafIcon,
  MoneyIcon,
  PeopleIcon,
  SmileIcon,
  SoloIcon,
  TalkIcon,
} from '@hashi/hds-icons'
import type { ComponentType, SVGProps } from 'react'

export type ReviewKeywordId = string

export interface ReviewKeywordOption {
  id: ReviewKeywordId
  code: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

type ReviewKeywordIcon = ReviewKeywordOption['Icon']

export const REVIEW_KEYWORDS: ReviewKeywordOption[] = [
  {
    id: 'delicious',
    code: 'FOOD_IS_DELICIOUS',
    label: '음식이 맛있어요',
    Icon: DeliciousIcon,
  },
  {
    id: 'mildSpice',
    code: 'MILD_SEASONING',
    label: '향신료가 강하지 않아요',
    Icon: LeafIcon,
  },
  {
    id: 'traditionalAtmosphere',
    code: 'TRADITIONAL_ATMOSPHERE',
    label: '전통적이에요',
    Icon: SoloIcon,
  },
  {
    id: 'kind',
    code: 'STAFF_IS_KIND',
    label: '직원분이 친절해요',
    Icon: SmileIcon,
  },
  {
    id: 'spaciousStore',
    code: 'SPACIOUS_INTERIOR',
    label: '매장이 넓어요',
    Icon: PeopleIcon,
  },
  {
    id: 'cleanStore',
    code: 'CLEAN_INTERIOR',
    label: '매장이 청결해요',
    Icon: CleanIcon,
  },
  {
    id: 'fast',
    code: 'FAST_SERVICE',
    label: '음식이 빨리 나와요',
    Icon: FastIcon,
  },
  {
    id: 'photo',
    code: 'PHOTO_FRIENDLY',
    label: '사진이 잘 나와요',
    Icon: CameraIcon,
  },
  {
    id: 'value',
    code: 'GOOD_VALUE',
    label: '가성비가 좋아요',
    Icon: MoneyIcon,
  },
  {
    id: 'conversation',
    code: 'GOOD_FOR_CONVERSATION',
    label: '대화하기 좋아요',
    Icon: TalkIcon,
  },
]

const reviewKeywordByCode = new Map(
  REVIEW_KEYWORDS.map((keyword) => [keyword.code, keyword]),
)
const reviewKeywordById = new Map(
  REVIEW_KEYWORDS.map((keyword) => [keyword.id, keyword]),
)
const reviewKeywordByLabel = new Map(
  REVIEW_KEYWORDS.map((keyword) => [keyword.label, keyword]),
)

export const getReviewKeywordByValue = (value: string) =>
  reviewKeywordByCode.get(value) ??
  reviewKeywordById.get(value) ??
  reviewKeywordByLabel.get(value)

export const getReviewKeywordIconByCode = (code: string) =>
  reviewKeywordByCode.get(code)?.Icon

export const getReviewKeywordIcon = ({
  code,
  label,
}: {
  code?: string
  label?: string
}): ReviewKeywordIcon | undefined =>
  (code ? reviewKeywordByCode.get(code)?.Icon : undefined) ??
  (label ? reviewKeywordByLabel.get(label)?.Icon : undefined)
