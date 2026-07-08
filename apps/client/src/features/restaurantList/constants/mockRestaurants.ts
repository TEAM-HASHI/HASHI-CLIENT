import type { Restaurant } from '../types'

export const MOCK_RESTAURANTS: Restaurant[] = Array.from(
  { length: 25 },
  (_, index) => ({
    id: String(index + 1),
    name: '히마와리 스시 신도심점',
    rating: 4.8,
    region: '도쿄',
    category: '초밥',
    images: [],
    description:
      '식당 소개를 여기 간단하게 한 줄 적어주세요. 식당 소개를 여기 간단하게 한 줄 적어주세요.',
    hashtags: ['#해시태그', '#해시태그', '#해시태그'],
  }),
)
