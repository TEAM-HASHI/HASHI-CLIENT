import type { FetchNextPageOptions } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

import {
  clearRestaurantListSnapshot,
  getRestaurantListSnapshot,
  saveRestaurantListScrollPosition,
} from '@/features/restaurantList/utils/restaurantListScrollRestoration'

type UseRestaurantListRestorationParams = {
  pageCount: number
  hasNextPage: boolean
  isPending: boolean
  isFetching: boolean
  isError: boolean
  fetchNextPage: (options?: FetchNextPageOptions) => Promise<unknown>
}

export const useRestaurantListRestoration = ({
  pageCount,
  hasNextPage,
  isPending,
  isFetching,
  isError,
  fetchNextPage,
}: UseRestaurantListRestorationParams) => {
  const location = useLocation()
  const navigationType = useNavigationType()
  const [target] = useState(() =>
    navigationType === 'POP'
      ? getRestaurantListSnapshot(location.key)
      : undefined,
  )
  const [targetLocationKey] = useState(location.key)
  const [isRestored, setIsRestored] = useState(!target)
  const isRestoring = !isRestored && location.key === targetLocationKey
  const hasRestorationError = Boolean(
    isRestoring &&
    target &&
    isError &&
    pageCount > 0 &&
    pageCount < target.pageCount &&
    hasNextPage,
  )

  useEffect(() => {
    if (
      !isRestoring ||
      !target ||
      isPending ||
      isFetching ||
      pageCount === 0 ||
      hasRestorationError
    ) {
      return
    }

    if (pageCount < target.pageCount && hasNextPage) {
      void fetchNextPage({ cancelRefetch: false }).catch(() => undefined)
      return
    }

    const frame = requestAnimationFrame(() => {
      window.scrollTo({ behavior: 'auto', top: target.scrollTop })
      clearRestaurantListSnapshot(location.key)
      setIsRestored(true)
    })

    return () => cancelAnimationFrame(frame)
  }, [
    fetchNextPage,
    hasNextPage,
    hasRestorationError,
    isFetching,
    isPending,
    isRestoring,
    location.key,
    pageCount,
    target,
  ])

  const saveScrollPosition = () => {
    saveRestaurantListScrollPosition(location.key, window.scrollY, pageCount)
  }

  return { hasRestorationError, isRestoring, saveScrollPosition }
}
