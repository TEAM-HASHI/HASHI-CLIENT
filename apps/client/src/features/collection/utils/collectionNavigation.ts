import type { CollectionManagementAction } from '@/features/collection/types'
import type { Location } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getAuthSessionVersion } from '@/shared/auth/authSession'

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
  collectionSaveSessionVersion: getAuthSessionVersion(),
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
  isRecord(state) &&
  (state.collectionSaveSessionVersion === undefined ||
    state.collectionSaveSessionVersion === getAuthSessionVersion()) &&
  typeof state.collectionSaveRestaurantId === 'string'
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

export const getCollectionManagementState = (
  state: unknown,
  action: CollectionManagementAction | null,
) => ({
  ...(isRecord(state) ? state : {}),
  collectionManagement: action,
})

export const getCollectionManagementAction = (
  state: unknown,
): CollectionManagementAction | null => {
  const action = isRecord(state) ? state.collectionManagement : undefined
  if (
    !isRecord(action) ||
    typeof action.collectionId !== 'string' ||
    !['edit', 'move', 'remove', 'delete', 'share'].includes(
      String(action.type),
    ) ||
    (action.restaurantIds !== undefined &&
      (!Array.isArray(action.restaurantIds) ||
        !action.restaurantIds.every(
          (id: unknown) => typeof id === 'string',
        ))) ||
    (action.dialog !== undefined &&
      action.dialog !== 'move' &&
      action.dialog !== 'remove')
  )
    return null
  return action as CollectionManagementAction
}

export const getCollectionEditorReturnKey = (state: unknown) =>
  isRecord(state) && typeof state.collectionEditorReturnKey === 'string'
    ? state.collectionEditorReturnKey
    : null
