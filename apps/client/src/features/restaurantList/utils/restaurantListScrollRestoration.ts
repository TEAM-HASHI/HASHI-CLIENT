type RestaurantListSnapshot = {
  pageCount: number
  scrollTop: number
}

const MAX_SNAPSHOT_COUNT = 50
const snapshots = new Map<string, RestaurantListSnapshot>()

export const saveRestaurantListScrollPosition = (
  locationKey: string,
  scrollTop: number,
  pageCount: number,
) => {
  snapshots.delete(locationKey)
  snapshots.set(locationKey, { pageCount, scrollTop })

  if (snapshots.size > MAX_SNAPSHOT_COUNT) {
    const oldestKey = snapshots.keys().next().value

    if (oldestKey !== undefined) {
      snapshots.delete(oldestKey)
    }
  }
}

export const getRestaurantListSnapshot = (locationKey: string) => {
  return snapshots.get(locationKey)
}

export const clearRestaurantListSnapshot = (locationKey: string) => {
  snapshots.delete(locationKey)
}
