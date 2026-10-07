import type {
  CollectionMapState,
  CollectionViewState,
} from '@/pages/saved/types'

export const isCollectionViewState = (
  state: unknown,
): state is CollectionViewState => {
  if (!state || typeof state !== 'object') return false
  return (
    'collectionId' in state &&
    (state.collectionId === null ||
      (typeof state.collectionId === 'string' &&
        state.collectionId.length > 0)) &&
    'sort' in state &&
    typeof state.sort === 'string' &&
    ['latest', 'rating', 'reviews'].includes(state.sort) &&
    'category' in state &&
    typeof state.category === 'string' &&
    ['all', 'restaurant', 'cafe', 'bar'].includes(state.category)
  )
}

export const isCollectionMapState = (
  state: unknown,
): state is CollectionMapState =>
  isCollectionViewState(state) && state.collectionId !== null
