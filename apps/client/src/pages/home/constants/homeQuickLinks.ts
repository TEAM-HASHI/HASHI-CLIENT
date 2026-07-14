import { ROUTES } from '@/app/router/path'

import type { HomeQuickLink } from '@/pages/home/homeContent'

export const HOME_QUICK_LINKS: HomeQuickLink[] = [
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
