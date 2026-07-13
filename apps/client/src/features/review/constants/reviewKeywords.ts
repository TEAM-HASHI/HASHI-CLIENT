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
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

type ReviewKeywordIcon = ReviewKeywordOption['Icon']

const reviewKeywordIconByCode = new Map<string, ReviewKeywordIcon>([
  ['FOOD_IS_DELICIOUS', DeliciousIcon],
  ['MILD_SEASONING', LeafIcon],
  ['STAFF_IS_KIND', SmileIcon],
  ['TRADITIONAL_ATMOSPHERE', SoloIcon],
  ['SPACIOUS_INTERIOR', PeopleIcon],
  ['CLEAN_INTERIOR', CleanIcon],
  ['FAST_SERVICE', FastIcon],
  ['PHOTO_FRIENDLY', CameraIcon],
  ['GOOD_VALUE', MoneyIcon],
  ['GOOD_FOR_CONVERSATION', TalkIcon],
])

export const getReviewKeywordIconByCode = (code: string) =>
  reviewKeywordIconByCode.get(code)

export const REVIEW_KEYWORDS: ReviewKeywordOption[] = [
  { id: 'delicious', label: '음식이 맛있어요', Icon: DeliciousIcon },
  { id: 'mildSpice', label: '향신료가 강하지 않아요', Icon: LeafIcon },
  { id: 'solo', label: '혼밥하기 좋아요', Icon: SoloIcon },
  { id: 'kind', label: '친절해요', Icon: SmileIcon },
  { id: 'spaciousStore', label: '매장이 넓어요', Icon: PeopleIcon },
  { id: 'cleanStore', label: '매장이 청결해요', Icon: CleanIcon },
  { id: 'fast', label: '음식이 빨리 나와요', Icon: FastIcon },
  { id: 'photo', label: '사진이 잘 나와요', Icon: CameraIcon },
  { id: 'value', label: '가성비가 좋아요', Icon: MoneyIcon },
  { id: 'conversation', label: '대화하기 좋아요', Icon: TalkIcon },
]
