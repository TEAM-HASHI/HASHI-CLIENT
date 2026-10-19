import { getSavedRestaurants } from '@/pages/saved/api/getSavedRestaurants'
import {
  isValidCollectionId,
  requireCollectionId,
} from '@/pages/saved/api/collectionReadContracts'
import { requireRestaurantIds } from '@/pages/saved/api/requireRestaurantIds'

export const getCollectionMovePlan = async (
  targetCollectionId: number,
  restaurantIds: readonly number[],
  signal?: AbortSignal,
) => {
  requireCollectionId(targetCollectionId)
  requireRestaurantIds(restaurantIds)
  const selectedIds = [...new Set(restaurantIds)]
  const selected = new Set(selectedIds)
  const duplicates = new Set<number>()
  const visitedCursors = new Set<string>()
  let cursor: string | undefined

  for (;;) {
    signal?.throwIfAborted()
    const page = await getSavedRestaurants(
      targetCollectionId,
      {
        sort: 'latest',
        size: 50,
        ...(cursor !== undefined && { cursor }),
      },
      signal,
    )
    signal?.throwIfAborted()
    for (const restaurant of page.content ?? []) {
      const id = restaurant.restaurantId
      if (!isValidCollectionId(id))
        throw new Error('Invalid restaurantId in move target response')
      if (selected.has(id)) duplicates.add(id)
    }
    if (!page.hasNext || duplicates.size === selected.size) break
    const nextCursor = page.nextCursor
    if (!nextCursor || visitedCursors.has(nextCursor))
      throw new Error('Invalid move target cursor')
    visitedCursors.add(nextCursor)
    cursor = nextCursor
  }

  return {
    movableIds: selectedIds.filter((id) => !duplicates.has(id)),
    duplicateIds: selectedIds.filter((id) => duplicates.has(id)),
  }
}
