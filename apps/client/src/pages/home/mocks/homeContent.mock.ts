import { ROUTES } from '@/app/router/path'

import type { HomeQuickLink, HotSnsRestaurant } from '@/pages/home/homeContent'

const createMockRestaurantImage = (label: string, backgroundColor: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="16" fill="${backgroundColor}"/><circle cx="80" cy="64" r="34" fill="#ffffff" opacity="0.55"/><text x="80" y="122" text-anchor="middle" fill="#273033" font-family="sans-serif" font-size="20" font-weight="700">${label}</text></svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

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

export const mockHotSnsRestaurants: HotSnsRestaurant[] = [
  {
    restaurantId: 'tonkatsu-fukumaru-yaesu',
    name: '돈카츠 후쿠마루 도쿄역 야에스점',
    summary: '바삭한 튀김옷과 두툼한 돼지고기로 정통 돈카츠를 즐겨요.',
    imageUrl: createMockRestaurantImage('돈카츠', '#ead7bf'),
    imageAlt: '돈카츠 후쿠마루 도쿄역 야에스점 대표 메뉴',
  },
  {
    restaurantId: 'gyukatsu-miyabi-ginza',
    name: '숯불 규카츠 미야비 긴자 본점',
    summary: '장인이 한 장씩 정성껏 튀겨내는 규카츠와 숯불의 풍미.',
    imageUrl: createMockRestaurantImage('규카츠', '#d8e2d7'),
    imageAlt: '숯불 규카츠 미야비 긴자 본점 대표 메뉴',
  },
]
