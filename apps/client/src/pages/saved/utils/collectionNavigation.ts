import type { Location } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const getCollectionSaveState = (
  state: unknown,
  restaurantId: string | null,
  selectedId: string | null = null,
) => ({
  ...(isRecord(state) ? state : {}),
  collectionSaveRestaurantId: restaurantId,
  collectionSaveSelectedId: selectedId,
})

export const getCollectionFormState = (
  location: Pick<Location, 'pathname' | 'search' | 'state' | 'key'>,
  restaurantId?: string,
  selectedId: string | null = null,
) => ({
  collectionReturn: {
    key: location.key,
    pathname: location.pathname,
    search: location.search,
    state: restaurantId
      ? getCollectionSaveState(location.state, restaurantId, selectedId)
      : (location.state as unknown),
  },
})

export const getCollectionReturn = (state: unknown) => {
  const target = isRecord(state) ? state.collectionReturn : undefined
  if (
    !isRecord(target) ||
    typeof target.pathname !== 'string' ||
    !target.pathname.startsWith('/') ||
    target.pathname.startsWith('//') ||
    typeof target.search !== 'string'
  )
    return { pathname: ROUTES.saved, search: '', state: null, key: null }
  return {
    key: typeof target.key === 'string' ? target.key : null,
    pathname: target.pathname,
    search: target.search,
    state: target.state,
  }
}

export const getCollectionSaveRestaurantId = (state: unknown) =>
  isRecord(state) && typeof state.collectionSaveRestaurantId === 'string'
    ? state.collectionSaveRestaurantId
    : null

export const getCollectionSaveSelectedId = (state: unknown) =>
  isRecord(state) && typeof state.collectionSaveSelectedId === 'string'
    ? state.collectionSaveSelectedId
    : null

// React Router가 관리하는 history index. 메모리 라우터에는 없어 POP으로 대체한다.
export const getCollectionHistoryIndex = () => {
  const state: unknown = window.history.state
  return isRecord(state) && typeof state.idx === 'number'
    ? state.idx
    : undefined
}
