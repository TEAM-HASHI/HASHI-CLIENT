import type { TabsItem } from '@hashi/hds-ui'

import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'

export const RESTAURANT_DETAIL_TABS = [
  { value: 'info', label: '매장 정보' },
  { value: 'menu', label: '메뉴' },
  { value: 'review', label: '리뷰' },
] satisfies (TabsItem & { value: RestaurantDetailTab })[]
