import { useMemo, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'hashi:search:recent-restaurants'
const CHANGE_EVENT = 'hashi:recent-restaurants-change'
const MAX_COUNT = 10

export interface RecentRestaurant {
  id: number
  name: string
}

const getSnapshot = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '[]'
  } catch {
    return '[]'
  }
}

const parseRestaurants = (stored: string): RecentRestaurant[] => {
  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    const ids = new Set<number>()
    return parsed
      .filter((item): item is RecentRestaurant => {
        if (
          !item ||
          !Number.isSafeInteger(item.id) ||
          item.id <= 0 ||
          typeof item.name !== 'string' ||
          !item.name.trim() ||
          ids.has(item.id)
        )
          return false
        ids.add(item.id)
        return true
      })
      .slice(0, MAX_COUNT)
  } catch {
    return []
  }
}

export const getRecentRestaurants = () => parseRestaurants(getSnapshot())

const writeRestaurants = (restaurants: RecentRestaurant[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants))
    window.dispatchEvent(new Event(CHANGE_EVENT))
  } catch {
    // Browsing must remain usable when local storage is unavailable.
  }
}

export const saveRecentRestaurant = (restaurant: RecentRestaurant) => {
  if (
    !Number.isSafeInteger(restaurant.id) ||
    restaurant.id <= 0 ||
    !restaurant.name.trim()
  )
    return
  writeRestaurants(
    [
      { id: restaurant.id, name: restaurant.name.trim() },
      ...getRecentRestaurants().filter(({ id }) => id !== restaurant.id),
    ].slice(0, MAX_COUNT),
  )
}

export const removeRecentRestaurants = (ids: number[]) => {
  const current = getRecentRestaurants()
  const next = current.filter(({ id }) => !ids.includes(id))
  if (next.length !== current.length) writeRestaurants(next)
}

export const clearRecentRestaurants = () => writeRestaurants([])

const subscribe = (onChange: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onChange()
  }
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

export const useRecentRestaurants = () => {
  const stored = useSyncExternalStore(subscribe, getSnapshot, () => '[]')
  return useMemo(() => parseRestaurants(stored), [stored])
}
