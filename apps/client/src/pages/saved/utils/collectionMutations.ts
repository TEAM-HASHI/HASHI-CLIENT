import type {
  CollectionColor,
  CollectionData,
  SavedCollection,
} from '@/pages/saved/types'

// SAVED_COLLECTION_SAVE / SAVED_COLLECTION_MANAGE 입력 제한.
export const COLLECTION_NAME_LIMIT = 20
export const COLLECTION_DESCRIPTION_LIMIT = 100
export type CollectionDraft = {
  name: string
  description: string
  color: CollectionColor | null
  isPublic: boolean
}

export const normalizeCollectionDraft = (
  draft: CollectionDraft,
  editing = false,
) => ({
  color: draft.color,
  isPublic: draft.isPublic,
  name: editing ? draft.name.trim() : draft.name,
  description: editing ? draft.description.trim() : draft.description,
})

export const validateCollection = (
  draft: CollectionDraft,
  collections: readonly SavedCollection[],
  editingId?: string,
) => {
  const value = normalizeCollectionDraft(draft, Boolean(editingId))
  if (!value.name.trim()) return 'name'
  if (draft.name.length > COLLECTION_NAME_LIMIT) return 'nameLength'
  if (draft.description.length > COLLECTION_DESCRIPTION_LIMIT)
    return 'descriptionLength'
  if (!value.color) return 'color'
  if (
    collections.some(
      (item) =>
        item.id !== editingId &&
        (editingId ? item.name.trim() : item.name) === value.name,
    )
  )
    return 'duplicate'
  return null
}

export const createCollection = (
  data: CollectionData,
  draft: CollectionDraft,
  id: string,
  createdAt: string,
): CollectionData => {
  if (validateCollection(draft, data.collections) || !draft.color) return data
  return {
    ...data,
    collections: [
      {
        ...draft,
        color: draft.color,
        id,
        createdAt,
        coverImages: [null, null, null],
        restaurants: [],
      },
      ...data.collections,
    ],
  }
}

export const updateCollection = (
  data: CollectionData,
  id: string,
  draft: CollectionDraft,
): CollectionData => {
  if (validateCollection(draft, data.collections, id) || !draft.color)
    return data
  const value = { ...normalizeCollectionDraft(draft, true), color: draft.color }
  return {
    ...data,
    collections: data.collections.map((item) =>
      item.id === id ? { ...item, ...value } : item,
    ),
  }
}

export const saveRestaurant = (
  data: CollectionData,
  collectionId: string,
  restaurantId: string,
  savedAt: string,
): CollectionData => {
  const collection = data.collections.find((item) => item.id === collectionId)
  if (
    !collection ||
    collection.restaurants.some((item) => item.restaurantId === restaurantId) ||
    !data.restaurants.some(
      (item) => item.id === restaurantId && item.visibility === 'visible',
    )
  )
    return data
  return {
    ...data,
    collections: data.collections.map((item) =>
      item.id === collectionId
        ? {
            ...item,
            restaurants: [...item.restaurants, { restaurantId, savedAt }],
          }
        : item,
    ),
  }
}
