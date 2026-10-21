import type { CollectionData } from '@/pages/saved/types'

// 사용자의 중복 저장 관계를 하나로 세며 식당 원본의 전체 저장 수를 추측하지 않는다.
export const getSavedRestaurantIds = (data: CollectionData) =>
  [
    ...new Set(
      data.collections.flatMap((c) => c.restaurants.map((r) => r.restaurantId)),
    ),
  ].sort()

export const getMoveSummary = (
  data: CollectionData,
  sourceId: string,
  targetId: string,
  ids: readonly string[],
) => {
  const source = data.collections.find((c) => c.id === sourceId)
  const target = data.collections.find((c) => c.id === targetId)
  if (!source || !target || sourceId === targetId)
    return { movable: [], duplicate: [] }
  const selected = [...new Set(ids)].filter(
    (id) =>
      source.restaurants.some((r) => r.restaurantId === id) &&
      data.restaurants.some((r) => r.id === id && r.visibility === 'visible'),
  )
  return {
    movable: selected.filter(
      (id) => !target.restaurants.some((r) => r.restaurantId === id),
    ),
    duplicate: selected.filter((id) =>
      target.restaurants.some((r) => r.restaurantId === id),
    ),
  }
}
export const removeRestaurants = (
  data: CollectionData,
  collectionId: string,
  ids: readonly string[],
): CollectionData => ({
  ...data,
  collections: data.collections.map((c) =>
    c.id === collectionId
      ? {
          ...c,
          restaurants: c.restaurants.filter(
            (r) => !ids.includes(r.restaurantId),
          ),
        }
      : c,
  ),
})
export const deleteCollection = (
  data: CollectionData,
  collectionId: string,
): CollectionData => ({
  ...data,
  collections: data.collections.filter((c) => c.id !== collectionId),
})
export const moveRestaurants = (
  data: CollectionData,
  sourceId: string,
  targetId: string,
  ids: readonly string[],
  savedAt: string,
): CollectionData => {
  const { movable } = getMoveSummary(data, sourceId, targetId, ids)
  if (!movable.length) return data
  const removed = removeRestaurants(data, sourceId, movable)
  return {
    ...removed,
    collections: removed.collections.map((c) =>
      c.id === targetId
        ? {
            ...c,
            restaurants: [
              ...c.restaurants,
              ...movable.map((restaurantId) => ({ restaurantId, savedAt })),
            ],
          }
        : c,
    ),
  }
}
