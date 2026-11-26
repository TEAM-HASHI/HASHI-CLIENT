import type { CollectionColor } from '@/features/collection/types'

export const COLLECTION_NAME_LIMIT = 20
export const COLLECTION_DESCRIPTION_LIMIT = 30
export type CollectionNameEntry = { id: string; name: string }

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
  collections: readonly CollectionNameEntry[],
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
  collections: readonly CollectionNameEntry[],
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
