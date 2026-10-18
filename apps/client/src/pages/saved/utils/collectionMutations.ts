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

// 서버 RestaurantCollectionService.isBlankChar와 같은 경계 공백 집합.
// JS trim()과 달리 U+0085/U+001C~001F는 제거하고 BOM(U+FEFF)은 유지한다.
const isCollectionBoundaryWhitespace = (character: string) =>
  /\p{White_Space}/u.test(character) ||
  (character >= '\u001c' && character <= '\u001f')

const stripCollectionBoundaryWhitespace = (value: string) => {
  let start = 0
  let end = value.length
  while (start < end && isCollectionBoundaryWhitespace(value[start])) start++
  while (end > start && isCollectionBoundaryWhitespace(value[end - 1])) end--
  return value.slice(start, end)
}

export const normalizeCollectionDraft = (
  draft: CollectionDraft,
): CollectionDraft => ({
  ...draft,
  name: stripCollectionBoundaryWhitespace(draft.name),
  description: stripCollectionBoundaryWhitespace(draft.description),
})

export const isDuplicateCollectionName = (
  draft: CollectionDraft,
  collections: readonly SavedCollection[],
  editingId?: string,
) => {
  const name = stripCollectionBoundaryWhitespace(draft.name)
  return collections.some(
    (item) =>
      item.id !== editingId &&
      stripCollectionBoundaryWhitespace(item.name) === name,
  )
}

export const validateCollection = (
  draft: CollectionDraft,
  collections: readonly SavedCollection[],
  editingId?: string,
) => {
  if (!stripCollectionBoundaryWhitespace(draft.name)) return 'name'
  if (draft.name.length > COLLECTION_NAME_LIMIT) return 'nameLength'
  if (draft.description.length > COLLECTION_DESCRIPTION_LIMIT)
    return 'descriptionLength'
  if (!draft.color) return 'color'
  if (isDuplicateCollectionName(draft, collections, editingId))
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
        ...normalizeCollectionDraft(draft),
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
  const value = { ...normalizeCollectionDraft(draft), color: draft.color }
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
