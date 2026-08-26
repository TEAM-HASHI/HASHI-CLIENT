import type { NavigateFunction } from 'react-router-dom'

import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'

export type RestaurantMenuDetailSource = 'today' | 'detail'

export interface RestaurantDetailLocationState {
  activeTab?: RestaurantDetailTab
}

export interface RestaurantMenuDetailLocationState {
  source?: RestaurantMenuDetailSource
}

export const getRestaurantDetailTabState = (
  state: unknown,
): RestaurantDetailLocationState => {
  if (typeof state !== 'object' || state === null || !('activeTab' in state)) {
    return {}
  }

  const activeTab = (state as RestaurantDetailLocationState).activeTab

  return activeTab === 'info' || activeTab === 'menu' || activeTab === 'review'
    ? { activeTab }
    : {}
}

export const getRestaurantMenuDetailSourceState = (
  state: unknown,
): RestaurantMenuDetailLocationState => {
  if (typeof state !== 'object' || state === null || !('source' in state)) {
    return {}
  }

  const source = (state as RestaurantMenuDetailLocationState).source

  return source === 'today' || source === 'detail' ? { source } : {}
}

export const navigateBackOrReplace = (
  navigate: NavigateFunction,
  fallbackPath: string,
) => {
  const historyIndex =
    typeof window.history.state === 'object' && window.history.state !== null
      ? Number((window.history.state as { idx?: unknown }).idx)
      : 0

  if (historyIndex > 0) {
    navigate(-1)
    return
  }

  navigate(fallbackPath, { replace: true })
}
