import type { RestaurantDetail } from '@/features/restaurantDetail/types/restaurantDetail'

const SHIO_RAMEN_DESCRIPTION =
  '맑고 깊은 닭 육수에 소금으로 간을 맞춘 라멘입니다. 재료 본연의 풍미를 살린 깔끔한 국물과 은은한 감칠맛이 특징으로, 담백한 라멘을 선호하는 분들에게 추천합니다.'

const MOCK_MENUS = Array.from({ length: 10 }, (_, index) => ({
  id: `shio-ramen-${index + 1}`,
  name: '시오라멘',
  description: SHIO_RAMEN_DESCRIPTION,
  priceCurrency: 'JPY',
  price: '1,000',
  isRepresentative: index < 2,
}))

const REVIEW_CONTENT =
  '정말 맛있습니다 와우!!! 정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!정말 맛있습니다 와우!!!'

const MOCK_REVIEWS = Array.from({ length: 25 }, (_, index) => ({
  id: `review-${index + 1}`,
  reviewerName: '혁줌마',
  rating: 4,
  date: '2026.06.28',
  content: REVIEW_CONTENT,
  images: ['', '', ''],
  keywords: ['친절해요', '음식이 빨리 나와요', '가성비가 좋아요'],
}))

export const MOCK_RESTAURANT_DETAIL: RestaurantDetail = {
  id: 'default',
  name: '야키니쿠 리키마루 이케부쿠로 히가시구치 텐',
  localName: '焼肉力丸 池袋東口店',
  rating: 3.8,
  reviewCount: 256,
  likeCount: '1,234',
  summary: '오사카 이케부쿠로에서 사랑받는 무제한 야키니쿠를 즐기세요.',
  address: '도쿄도 토시마구 남이케부쿠 1-22-2 FLC빌딩 5층',
  visitDateLabel: '6/19 (금)',
  openTime: '10:00',
  closeTime: '22:00',
  deposit: '4,000원',
  detailDescription:
    '오사카에 있는 인기 있는 무제한 야키니쿠 레스토랑 “야키니쿠 리키마루”가 이케부쿠역에서 도보 30초 거리에 도쿄로 가까우선했습니다! 저희 레스토랑은 자랑스럽게 “Delicio”라고 주장합니다미국 고기! 무제한 야키니쿠의 중심에서 매일 합리적인 가격에 신선한 손으로 썰어 만든 고기를 즐기실 수 있습니다. 저희는 또한 순두부와 냉면을 포함한 다양한 수제 반찬을 제공하고 있습니다. 점심 영업을 위해, 낮 동안 무제한 제공되는 세 가지 코스를 즐기실 수 있습니다! 특별한 순간을 위해 넓은 박스 좌석에서 정통 야키니쿠를 경험해 보세요.',
  lastOrderTime: '22:00',
  businessHours: [
    { day: '월', hours: '11:00 - 22:00' },
    { day: '화', hours: '11:00 - 22:00' },
    { day: '수', hours: '11:00 - 22:00' },
    { day: '목', hours: '11:00 - 22:00' },
    { day: '금', hours: '11:00 - 22:00' },
    { day: '토', hours: '11:00 - 22:00' },
    { day: '일', hours: '11:00 - 22:00' },
  ],
  priceRange: 'JPY 1,000 - JPY 2,000',
  heroImages: [],
  menus: MOCK_MENUS,
  reviews: MOCK_REVIEWS,
}
