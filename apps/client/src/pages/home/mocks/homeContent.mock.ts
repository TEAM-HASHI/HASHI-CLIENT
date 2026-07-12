import { ROUTES } from '@/app/router/path'

import type { HomeQuickLink, HotSnsRestaurant } from '@/pages/home/homeContent'
import type { HomeBanner, HomeQuickLink } from '@/pages/home/homeContent'

const createMockBannerImage = (label: string, backgroundColor: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360"><rect width="720" height="360" rx="32" fill="${backgroundColor}"/><text x="52" y="162" fill="#273033" font-family="sans-serif" font-size="42" font-weight="700">${label}</text><text x="52" y="216" fill="#5f696d" font-family="sans-serif" font-size="24" font-weight="500">API 연결 전 임시 이미지</text></svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const createMockRestaurantImage = (label: string, backgroundColor: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="16" fill="${backgroundColor}"/><circle cx="80" cy="64" r="34" fill="#ffffff" opacity="0.55"/><text x="80" y="122" text-anchor="middle" fill="#273033" font-family="sans-serif" font-size="20" font-weight="700">${label}</text></svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const mockHomeBanners: HomeBanner[] = [
  {
    id: 'tokyo-curation',
    imageUrl: createMockBannerImage('도쿄 미식 큐레이션', '#f4f1ec'),
    imageAlt: '도쿄 미식 큐레이션 배너',
    instagramUrl: 'https://www.instagram.com/hashi_tokyo_curation/',
  },
  {
    id: 'ginza-dinner',
    imageUrl: createMockBannerImage('긴자 저녁 추천', '#eef3f2'),
    imageAlt: '긴자 저녁 추천 큐레이션 배너',
    instagramUrl: 'https://www.instagram.com/hashi_ginza_dinner/',
  },
  {
    id: 'shinjuku-lunch',
    imageUrl: createMockBannerImage('신주쿠 점심 산책', '#f1edf5'),
    imageAlt: '신주쿠 점심 산책 큐레이션 배너',
    instagramUrl: 'https://www.instagram.com/hashi_shinjuku_lunch/',
  },
  {
    id: 'omakase-night',
    imageUrl: createMockBannerImage('오마카세 나이트', '#edf2f5'),
    imageAlt: '오마카세 나이트 큐레이션 배너',
    instagramUrl: 'https://www.instagram.com/hashi_omakase_night/',
  },
]

export const mockQuickLinks: HomeQuickLink[] = [
  {
    id: 'hashiPick',
    label: '하시 PICK',
    to: ROUTES.hashiPickRestaurants,
  },
  {
    id: 'popular',
    label: '인기 맛집',
    to: ROUTES.popularRestaurants,
  },
  {
    id: 'magazine',
    label: '매거진',
    to: ROUTES.magazines,
  },
  {
    id: 'todayRestaurant',
    label: '오늘의 식당',
    to: ROUTES.todayRestaurant,
  },
]
