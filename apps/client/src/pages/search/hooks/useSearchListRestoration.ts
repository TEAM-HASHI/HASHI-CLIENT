import type { FetchNextPageOptions } from '@tanstack/react-query'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

interface SearchListSnapshot {
  pageCount: number
  scrollY: number
}

interface RestorationOptions {
  enabled: boolean
  pageCount: number
  hasNextPage: boolean
  isFetching: boolean
  isError: boolean
  fetchNextPage: (options?: FetchNextPageOptions) => Promise<unknown>
}

const readSnapshot = (key: string): SearchListSnapshot | undefined => {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(key) ?? 'null')
    if (
      typeof value !== 'object' ||
      value === null ||
      !('pageCount' in value) ||
      !('scrollY' in value) ||
      typeof value.pageCount !== 'number' ||
      !Number.isSafeInteger(value.pageCount) ||
      value.pageCount < 1 ||
      typeof value.scrollY !== 'number' ||
      !Number.isFinite(value.scrollY) ||
      value.scrollY < 0
    )
      return undefined
    return { pageCount: value.pageCount, scrollY: value.scrollY }
  } catch {
    return undefined
  }
}

const createEntry = (key: string, shouldRestore: boolean) => {
  const target = shouldRestore ? readSnapshot(key) : undefined
  return {
    key,
    target,
    restored: !target,
  }
}

export const useSearchListRestoration = ({
  enabled,
  pageCount,
  hasNextPage,
  isFetching,
  isError,
  fetchNextPage,
}: RestorationOptions) => {
  const location = useLocation()
  const navigationType = useNavigationType()
  const storageKey = `search-list:${location.key}:${location.search}`
  const [entry, setEntry] = useState(() =>
    createEntry(storageKey, enabled && navigationType === 'POP'),
  )
  if (entry.key !== storageKey) {
    setEntry(createEntry(storageKey, enabled && navigationType === 'POP'))
  }
  const { target, restored } = entry
  const pageCountRef = useRef(pageCount)

  useLayoutEffect(() => {
    pageCountRef.current = pageCount
  }, [pageCount])

  useEffect(() => {
    if (
      !enabled ||
      restored ||
      !target ||
      isFetching ||
      isError ||
      pageCount === 0
    )
      return
    if (pageCount < target.pageCount && hasNextPage) {
      void fetchNextPage({ cancelRefetch: false })
      return
    }
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: target.scrollY, behavior: 'instant' })
      setEntry((current) => ({ ...current, restored: true }))
    })
    return () => cancelAnimationFrame(frame)
  }, [
    enabled,
    restored,
    target,
    isFetching,
    isError,
    pageCount,
    hasNextPage,
    fetchNextPage,
  ])

  useLayoutEffect(() => {
    if (!enabled || !restored) return
    // 새 검색/필터는 같은 pathname에서도 최상단부터 시작합니다.
    if (!target) window.scrollTo({ top: 0, behavior: 'instant' })
    let scrollY = window.scrollY
    const handleScroll = () => {
      scrollY = window.scrollY
    }
    const save = () => {
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ pageCount: pageCountRef.current, scrollY }),
        )
      } catch {
        /* 저장소를 사용할 수 없어도 검색은 계속할 수 있습니다. */
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('pagehide', save)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('pagehide', save)
      save()
    }
  }, [enabled, restored, storageKey, target])

  return enabled && !restored
}
