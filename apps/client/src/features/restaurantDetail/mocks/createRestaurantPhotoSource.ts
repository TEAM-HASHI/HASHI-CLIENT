import type {
  RestaurantPhoto,
  RestaurantPhotoCategory,
  RestaurantPhotoFilter,
  RestaurantPhotoSource,
} from '@/features/restaurantDetail/types/restaurantPhoto'

export interface RestaurantPhotoFixture extends RestaurantPhoto {
  originalId: string
  restaurantId: number
  category: RestaurantPhotoCategory
  order: number
  publishedAt: string
  isPublic: boolean
}

const PAGE_SIZE = 20

const uniqueOriginals = (photos: RestaurantPhotoFixture[]) => {
  const seen = new Set<string>()
  return photos.filter(({ originalId }) => {
    if (seen.has(originalId)) return false
    seen.add(originalId)
    return true
  })
}

export const createRestaurantPhotoSource = (
  fixtures: readonly RestaurantPhotoFixture[],
): RestaurantPhotoSource => ({
  getPage: async ({ restaurantId, filter, cursor, signal }) => {
    signal?.throwIfAborted()
    const visible = fixtures.filter(
      (photo) => photo.restaurantId === restaurantId && photo.isPublic,
    )
    const representative = visible
      .filter((photo) => photo.category === 'representative')
      .sort((a, b) => a.order - b.order)
    const menu = visible
      .filter((photo) => photo.category === 'menu')
      .sort((a, b) => a.order - b.order)
    const review = visible
      .filter((photo) => photo.category === 'review')
      .sort(
        (a, b) =>
          Date.parse(b.publishedAt) - Date.parse(a.publishedAt) ||
          a.order - b.order,
      )
    const mixed: RestaurantPhotoFixture[] = []
    for (
      let index = 0;
      index < Math.max(representative.length, Math.ceil(review.length / 3));
      index += 1
    ) {
      if (representative[index]) mixed.push(representative[index])
      mixed.push(...review.slice(index * 3, index * 3 + 3))
    }
    const groups: Record<RestaurantPhotoFilter, RestaurantPhotoFixture[]> = {
      all: uniqueOriginals([...mixed, ...menu]),
      representative,
      menu,
      review,
    }
    // This scoped offset cursor belongs only to the mock; the backend may use a different contract.
    const prefix = `${restaurantId}:${filter}:`
    let offset = 0
    if (cursor !== undefined) {
      if (!cursor.startsWith(prefix))
        throw new Error('Invalid mock photo cursor')
      const value = cursor.slice(prefix.length)
      offset = Number(value)
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(offset))
        throw new Error('Invalid mock photo cursor')
    }
    const selected = groups[filter]
    const nextOffset = offset + PAGE_SIZE
    return {
      photos: selected
        .slice(offset, nextOffset)
        .map(({ id, thumbnailUrl, imageUrl, width, height }) => ({
          id,
          thumbnailUrl,
          imageUrl,
          width,
          height,
        })),
      counts: {
        all: groups.all.length,
        representative: representative.length,
        menu: menu.length,
        review: review.length,
      },
      nextCursor:
        nextOffset < selected.length ? `${prefix}${nextOffset}` : undefined,
    }
  },
})
