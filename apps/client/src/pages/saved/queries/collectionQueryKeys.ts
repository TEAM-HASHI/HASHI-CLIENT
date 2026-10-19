import type {
  CollectionsListFiltersTypes,
  SavedRestaurantsFiltersTypes,
} from '@/pages/saved/api/collectionApiTypes'

export const collectionQueryKeys = {
  all: ['collections'] as const,
  lists: () => [...collectionQueryKeys.all, 'list'] as const,
  infiniteList: (params: CollectionsListFiltersTypes | null) =>
    [...collectionQueryKeys.lists(), 'infinite', params] as const,
  details: () => [...collectionQueryKeys.all, 'detail'] as const,
  detail: (collectionId: number | null, publicView = false) =>
    [
      ...collectionQueryKeys.details(),
      collectionId,
      ...(publicView ? ['public'] : []),
    ] as const,
  restaurantLists: (collectionId: number | null) =>
    [...collectionQueryKeys.all, 'restaurants', collectionId] as const,
  movePlan: (
    targetCollectionId: number | null,
    restaurantIds: readonly number[],
  ) =>
    [
      ...collectionQueryKeys.restaurantLists(targetCollectionId),
      'move-plan',
      restaurantIds,
    ] as const,
  restaurants: (
    collectionId: number | null,
    params: SavedRestaurantsFiltersTypes | null,
    publicView = false,
  ) =>
    [
      ...collectionQueryKeys.restaurantLists(collectionId),
      'infinite',
      params,
      ...(publicView ? ['public'] : []),
    ] as const,
}
