import { getAuthSessionVersion } from '@/shared/auth/authSession'

import type {
  CollectionsListFiltersTypes,
  SavedRestaurantsFiltersTypes,
} from '@/pages/saved/api/collectionApiTypes'

export const collectionQueryKeys = {
  all: ['collections'] as const,
  lists: (sessionVersion = getAuthSessionVersion()) =>
    [...collectionQueryKeys.all, sessionVersion, 'list'] as const,
  infiniteList: (
    params: CollectionsListFiltersTypes | null,
    sessionVersion = getAuthSessionVersion(),
  ) =>
    [...collectionQueryKeys.lists(sessionVersion), 'infinite', params] as const,
  details: (sessionVersion = getAuthSessionVersion()) =>
    [...collectionQueryKeys.all, sessionVersion, 'detail'] as const,
  detail: (
    collectionId: number | null,
    publicView = false,
    sessionVersion = getAuthSessionVersion(),
  ) =>
    [
      ...collectionQueryKeys.details(sessionVersion),
      collectionId,
      ...(publicView ? ['public'] : []),
    ] as const,
  restaurantLists: (
    collectionId: number | null,
    sessionVersion = getAuthSessionVersion(),
  ) =>
    [
      ...collectionQueryKeys.all,
      sessionVersion,
      'restaurants',
      collectionId,
    ] as const,
  movePlan: (
    targetCollectionId: number | null,
    restaurantIds: readonly number[],
    sessionVersion = getAuthSessionVersion(),
  ) =>
    [
      ...collectionQueryKeys.restaurantLists(
        targetCollectionId,
        sessionVersion,
      ),
      'move-plan',
      restaurantIds,
    ] as const,
  restaurants: (
    collectionId: number | null,
    params: SavedRestaurantsFiltersTypes | null,
    publicView = false,
    sessionVersion = getAuthSessionVersion(),
  ) =>
    [
      ...collectionQueryKeys.restaurantLists(collectionId, sessionVersion),
      'infinite',
      params,
      ...(publicView ? ['public'] : []),
    ] as const,
  mapMarkers: (
    id: number,
    version = getAuthSessionVersion(),
    publicView = false,
  ) =>
    [
      ...collectionQueryKeys.restaurantLists(id, version),
      'map-markers',
      publicView,
    ] as const,
}
