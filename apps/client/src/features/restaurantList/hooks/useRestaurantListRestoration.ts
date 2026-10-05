import { useCallback, useRef, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

import type { RestaurantsResult } from '@/features/restaurantList/api/getRestaurants'
import type { RestaurantsInfiniteData } from '@/features/restaurantList/queries/useRestaurantsInfiniteQuery'
import type { RestaurantListCurationType } from '@/features/restaurantList/types'

type ListSnapshot = {
  sort: string
  category: string
  scrollTop: number
  pageCount: number
  data?: RestaurantsInfiniteData
}

const SNAPSHOT_PREFIX = 'hashi:restaurant-list:'

const readSnapshot = (key: string): ListSnapshot | null => {
  try {
    const value = JSON.parse(sessionStorage.getItem(key) ?? 'null')
    const pageCount = value?.pageCount ?? value?.data?.pages?.length
    if (
      typeof value?.sort !== 'string' ||
      typeof value?.category !== 'string' ||
      !Number.isFinite(value?.scrollTop) ||
      !Number.isInteger(pageCount) ||
      pageCount < 1
    ) {
      return null
    }
    if (
      value.data !== undefined &&
      (!Array.isArray(value.data?.pages) ||
        !Array.isArray(value.data?.pageParams) ||
        !value.data.pageParams.every(
          (param: unknown) => param === null || typeof param === 'string',
        ) ||
        value.data.pages.length !== pageCount ||
        value.data.pages.length !== value.data.pageParams.length ||
        !value.data.pages.every((page: RestaurantsResult) =>
          Array.isArray(page?.restaurants),
        ))
    )
      return null
    return {
      sort: value.sort,
      category: value.category,
      scrollTop: value.scrollTop,
      pageCount,
      data: value.data,
    }
  } catch {
    return null
  }
}

const compactSnapshots = () => {
  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index)
    if (!key?.startsWith(SNAPSHOT_PREFIX)) continue
    const snapshot = readSnapshot(key)
    if (snapshot?.data) {
      sessionStorage.setItem(
        key,
        JSON.stringify({ ...snapshot, data: undefined }),
      )
    }
  }
}

export const useRestaurantListRestoration = (
  type: RestaurantListCurationType,
) => {
  const location = useLocation()
  const navigationType = useNavigationType()
  const storageKey = `${SNAPSHOT_PREFIX}${type}:${location.key}`
  const [snapshot, setSnapshot] = useState(() =>
    navigationType === 'POP' ? readSnapshot(storageKey) : null,
  )
  const didRestore = useRef(false)

  const restoreScroll = useCallback(() => {
    if (!snapshot || didRestore.current) return

    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: snapshot.scrollTop, left: 0, behavior: 'auto' })
      didRestore.current = true
    })
    return () => cancelAnimationFrame(frame)
  }, [snapshot])

  const saveSnapshot = (value: {
    sort: string
    category: string
    data: RestaurantsInfiniteData
  }) => {
    const metadata = {
      sort: value.sort,
      category: value.category,
      pageCount: value.data.pages.length,
      scrollTop: window.scrollY,
    }
    try {
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ ...metadata, data: value.data }),
        )
      } catch (error) {
        if (
          !(error instanceof DOMException) ||
          error.name !== 'QuotaExceededError'
        )
          throw error
        compactSnapshots()
        sessionStorage.setItem(storageKey, JSON.stringify(metadata))
      }
    } catch {
      return
    }
  }

  const clearSnapshot = () => {
    setSnapshot(null)
    try {
      sessionStorage.removeItem(storageKey)
    } catch {
      return
    }
  }

  return { snapshot, saveSnapshot, clearSnapshot, restoreScroll }
}
