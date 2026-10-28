import type { CollectionData, SavedCollection } from '@/pages/saved/types'
import type { CollectionColor } from '@/features/collection/types'

// 컬렉션 입력 제한. 설명은 2026-10-18 기획 답변으로 100자에서 30자로 변경.
export const COLLECTION_NAME_LIMIT = 20
export const COLLECTION_DESCRIPTION_LIMIT = 30
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

export const normalizeCollectionDescription = (description: string) =>
  description.replace(/\r\n|[\r\n\u2028\u2029]/g, ' ')

export const normalizeCollectionDraft = (
  draft: CollectionDraft,
): CollectionDraft => ({
  ...draft,
  name: stripCollectionBoundaryWhitespace(draft.name),
  description: stripCollectionBoundaryWhitespace(
    normalizeCollectionDescription(draft.description),
  ),
})

export const isDuplicateCollectionName = (
  draft: CollectionDraft,
  collections: readonly Pick<SavedCollection, 'id' | 'name'>[],
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
  collections: readonly Pick<SavedCollection, 'id' | 'name'>[],
  editingId?: string,
) => {
  if (!stripCollectionBoundaryWhitespace(draft.name)) return 'name'
  if (draft.name.length > COLLECTION_NAME_LIMIT) return 'nameLength'
  if (
    normalizeCollectionDescription(draft.description).length >
    COLLECTION_DESCRIPTION_LIMIT
  )
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
