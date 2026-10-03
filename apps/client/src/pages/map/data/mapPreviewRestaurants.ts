import type { MapRestaurant } from '@/pages/map/types'
import tonkatsu1 from '@/shared/assets/images/map/tonkatsu-1.webp'
import tonkatsu2 from '@/shared/assets/images/map/tonkatsu-2.webp'
import tonkatsu3 from '@/shared/assets/images/map/tonkatsu-3.webp'
import yakiniku1 from '@/shared/assets/images/map/yakiniku-1.webp'
import yakiniku2 from '@/shared/assets/images/map/yakiniku-2.webp'
import sushi1 from '@/shared/assets/images/map/sushi-1.webp'
import sushi2 from '@/shared/assets/images/map/sushi-2.webp'
import sushi3 from '@/shared/assets/images/map/sushi-3.webp'

export const MAP_PREVIEW_AREAS = [
  { code: 'shinjuku', name: '신주쿠', x: 12, y: 36 },
  { code: 'shibuya', name: '시부야', x: 12, y: 56 },
  { code: 'ginza', name: '긴자', x: 52, y: 45 },
  { code: 'ueno', name: '우에노', x: 34, y: 23 },
  { code: 'asakusa', name: '아사쿠사', x: 65, y: 30 },
] as const

const common = {
  saveCount: 1234,
  hours: '평일 · 12:00~19:00',
  price: 'JPY 1,000~2,000',
  description:
    '도쿄에서 즐기는 맛집 미리보기입니다. 신선한 재료를 사용한 요리와 함께 편안한 식사를 즐겨보세요. 이 화면의 식당 정보, 사진, 위치, 영업시간은 퍼블리싱 확인용 샘플이며 실제 매장 정보와 다를 수 있습니다.',
  address: '도쿄 · 샘플 주소 (실제 위치 미연동)',
}

export const MAP_PREVIEW_RESTAURANTS: MapRestaurant[] = [
  {
    ...common,
    id: 'preview-tonkatsu',
    name: '코코네 돈카츠 신도심점',
    areaCode: 'shinjuku',
    category: 'restaurant',
    cuisine: '돈카츠',
    rating: 4.8,
    reviewCount: 124,
    recommendationRank: 1,
    menuKeywords: ['돈카츠', '튀김'],
    images: [tonkatsu1, tonkatsu2, tonkatsu3],
    marker: { x: 48, y: 25 },
  },
  {
    ...common,
    id: 'preview-yakiniku',
    name: '야키니쿠 리키마루',
    areaCode: 'shibuya',
    category: 'restaurant',
    cuisine: '야키니쿠',
    rating: 4.8,
    reviewCount: 256,
    recommendationRank: 2,
    menuKeywords: ['고기', '야키니쿠'],
    images: [yakiniku1, yakiniku2, yakiniku1],
    marker: { x: 64, y: 34 },
    description:
      '오사카에 있는 인기 있는 무제한 야키니쿠 레스토랑 “야키니쿠 리키마루”가 이케부쿠역에서 도보 30초 거리에 도쿄로 가까우선했습니다! 저희 레스토랑은 자랑스럽게 “Delicio”라고 주장합니다미국 고기! 무제한 야키니쿠의 중심에서 매일 합리적인 가격에 신선한 손으로 썰어 만든 고기를 즐기실 수 있습니다. 저희는 또한 순두부와 냉면을 포함한 다양한 수제 반찬을 제공하고 있습니다. 점심 영업을 위해, 낮 동안 무제한 제공되는 세 가지 코스를 즐기실 수 있습니다! 특별한 순간을 위해 넓은 박스 좌석에서 정통 야키니쿠를 경험해 보세요.',
  },
  {
    ...common,
    id: 'preview-katsu',
    name: '카츠카츠',
    areaCode: 'ueno',
    category: 'restaurant',
    cuisine: '돈카츠',
    rating: 4.6,
    reviewCount: 78,
    recommendationRank: 3,
    menuKeywords: ['돈카츠'],
    images: [tonkatsu1, tonkatsu2, tonkatsu3],
    marker: { x: 48, y: 53 },
  },
  {
    ...common,
    id: 'preview-sushi',
    name: '히마와리 스시 신도심점',
    areaCode: 'ginza',
    category: 'restaurant',
    cuisine: '초밥',
    rating: 4.9,
    reviewCount: 310,
    recommendationRank: 4,
    menuKeywords: ['스시', '초밥', '연어'],
    images: [sushi1, sushi2, sushi3],
    marker: { x: 81, y: 55 },
  },
  {
    ...common,
    id: 'preview-cafe',
    name: '도쿄 카페 미리보기',
    areaCode: 'shibuya',
    category: 'cafe',
    cuisine: '카페',
    rating: 4.5,
    reviewCount: 42,
    recommendationRank: 5,
    menuKeywords: ['커피', '라떼'],
    images: [],
    marker: { x: 40, y: 62 },
  },
  {
    ...common,
    id: 'preview-bar',
    name: '아사쿠사 주점 미리보기',
    areaCode: 'asakusa',
    category: 'bar',
    cuisine: '주점',
    rating: 4.7,
    reviewCount: 85,
    recommendationRank: 6,
    menuKeywords: ['맥주', '사케'],
    images: [],
    marker: { x: 17, y: 43 },
  },
  {
    ...common,
    id: 'preview-long',
    name: '만약 식당명이 길어진다면 한 줄까지만 표시하는 도쿄 식당 미리보기',
    areaCode: 'shinjuku',
    category: 'restaurant',
    cuisine: '야키니쿠',
    rating: 4.3,
    reviewCount: 18,
    recommendationRank: 7,
    menuKeywords: ['고기'],
    images: [yakiniku1, yakiniku2],
    marker: { x: 86, y: 24 },
  },
]
