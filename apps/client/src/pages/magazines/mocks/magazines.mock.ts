import type {
  MagazineHeroBanner,
  RecommendedMagazine,
} from '@/pages/magazines/types'

const INSTAGRAM_BASE_URL = 'https://www.instagram.com/hashi.magazine'

export const magazineHeroBanners: MagazineHeroBanner[] = [
  {
    id: '3',
    imageUrl:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=1200&q=80',
    instagramUrl: `${INSTAGRAM_BASE_URL}/3`,
    displayOrder: 3,
    accessibilityLabel: '하시가 추천하는 도쿄 미식 매거진 3',
  },
  {
    id: '1',
    imageUrl:
      'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1200&q=80',
    instagramUrl: `${INSTAGRAM_BASE_URL}/1`,
    displayOrder: 1,
    accessibilityLabel: '하시가 추천하는 도쿄 미식 매거진 1',
  },
  {
    id: '4',
    imageUrl:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
    instagramUrl: `${INSTAGRAM_BASE_URL}/4`,
    displayOrder: 4,
    accessibilityLabel: '하시가 추천하는 도쿄 미식 매거진 4',
  },
  {
    id: '2',
    imageUrl:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
    instagramUrl: `${INSTAGRAM_BASE_URL}/2`,
    displayOrder: 2,
    accessibilityLabel: '하시가 추천하는 도쿄 미식 매거진 2',
  },
  {
    id: '5',
    imageUrl:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    instagramUrl: `${INSTAGRAM_BASE_URL}/5`,
    displayOrder: 5,
    accessibilityLabel: '하시가 추천하는 도쿄 미식 매거진 5',
  },
]

export const recommendedMagazines: RecommendedMagazine[] = [
  {
    id: '101',
    title:
      '[청와대 셰프가 추천하는 도쿄 스시 맛집 8선] 제목은 여기까지 좌랄랄랄라라라 넘으면...',
    imageUrl:
      'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80',
    publishedDate: '2000. 00. 00.',
    instagramUrl: `${INSTAGRAM_BASE_URL}/101`,
  },
  {
    id: '102',
    title:
      '청와대 셰프가 추천하는 도쿄 스시 맛집 8선입니다. 제목은 여기까지 좌랄랄랄라라라 넘으 ...',
    imageUrl:
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    publishedDate: '2000. 00. 00.',
    instagramUrl: `${INSTAGRAM_BASE_URL}/102`,
  },
  {
    id: '103',
    title: '청와대 셰프가 추천하는 도쿄 스시 맛집 8선입니다.',
    imageUrl:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    publishedDate: '2000. 00. 00.',
    instagramUrl: `${INSTAGRAM_BASE_URL}/103`,
  },
  {
    id: '104',
    title:
      '청와대 셰프가 추천하는 도쿄 스시 맛집 8선입니다. 제목은 여기까지 좌랄랄랄라라라 넘으 ...',
    imageUrl:
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    publishedDate: '2000. 00. 00.',
    instagramUrl: `${INSTAGRAM_BASE_URL}/104`,
  },
  {
    id: '105',
    title:
      '청와대 셰프가 추천하는 도쿄 스시 맛집 8선입니다. 제목은 여기까지 좌랄랄랄라라라 넘으 ...',
    imageUrl:
      'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80',
    publishedDate: '2000. 00. 00.',
    instagramUrl: `${INSTAGRAM_BASE_URL}/105`,
  },
]
