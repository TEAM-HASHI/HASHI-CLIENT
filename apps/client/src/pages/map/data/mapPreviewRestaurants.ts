import type { MapRestaurant } from '@/pages/map/types'
import tonkatsu1 from '@/shared/assets/images/map/preview/tonkatsu-1.webp'
import tonkatsu2 from '@/shared/assets/images/map/preview/tonkatsu-2.webp'
import tonkatsu3 from '@/shared/assets/images/map/preview/tonkatsu-3.webp'
import yakiniku1 from '@/shared/assets/images/map/preview/yakiniku-1.webp'
import yakiniku2 from '@/shared/assets/images/map/preview/yakiniku-2.webp'
import sushi1 from '@/shared/assets/images/map/preview/sushi-1.webp'
import sushi2 from '@/shared/assets/images/map/preview/sushi-2.webp'
import sushi3 from '@/shared/assets/images/map/preview/sushi-3.webp'

export const MAP_PREVIEW_AREAS = [
  {
    code: 'shinjuku',
    name: '신주쿠',
    position: { lat: 35.6938, lng: 139.7034 },
  },
  {
    code: 'shibuya',
    name: '시부야',
    position: { lat: 35.6595, lng: 139.7005 },
  },
  { code: 'ginza', name: '긴자', position: { lat: 35.6717, lng: 139.765 } },
  { code: 'ueno', name: '우에노', position: { lat: 35.7142, lng: 139.7774 } },
  {
    code: 'asakusa',
    name: '아사쿠사',
    position: { lat: 35.7148, lng: 139.7967 },
  },
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
    position: { lat: 35.694, lng: 139.703 },
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
    position: { lat: 35.6605, lng: 139.7015 },
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
    position: { lat: 35.715, lng: 139.778 },
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
    position: { lat: 35.672, lng: 139.765 },
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
    position: { lat: 35.6585, lng: 139.6995 },
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
    position: { lat: 35.7145, lng: 139.7965 },
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
    position: { lat: 35.6955, lng: 139.705 },
  },
]
