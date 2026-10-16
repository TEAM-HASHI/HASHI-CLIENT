import type { FetchNextPageOptions } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

interface ListSnapshot {
  pageCount: number
  scrollY: number
}

interface RestorationOptions {
  pageCount: number
  hasNextPage: boolean
  isFetching: boolean
  isError: boolean
  fetchNextPage: (options?: FetchNextPageOptions) => Promise<unknown>
}

const readSnapshot = (key: string): ListSnapshot | undefined => {
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
    ) {
      return undefined
    }
    return { pageCount: value.pageCount, scrollY: value.scrollY }
  } catch {
    return undefined
  }
}

export const useMagazineListRestoration = ({
  pageCount,
  hasNextPage,
  isFetching,
  isError,
  fetchNextPage,
}: RestorationOptions) => {
  const { key } = useLocation()
  const navigationType = useNavigationType()
  const storageKey = `magazine-list:${key}`
  const [target] = useState(() =>
    navigationType === 'POP' ? readSnapshot(storageKey) : undefined,
  )
  const [restored, setRestored] = useState(!target)
  const snapshotRef = useRef<ListSnapshot>({
    pageCount,
    scrollY: target?.scrollY ?? window.scrollY,
  })

  useEffect(() => {
    snapshotRef.current.pageCount = pageCount
  }, [pageCount])

  useEffect(() => {
    if (restored || !target || isFetching || isError || pageCount === 0) return
    if (pageCount < target.pageCount && hasNextPage) {
      void fetchNextPage({ cancelRefetch: false })
      return
    }
    // 목록과 배너가 반영된 뒤 복원해 전역 경로 변경 시의 상단 초기화와 충돌하지 않습니다.
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: target.scrollY, behavior: 'auto' })
      setRestored(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [
    restored,
    target,
    isFetching,
    isError,
    pageCount,
    hasNextPage,
    fetchNextPage,
  ])

  useEffect(() => {
    if (!restored) return
    const save = () => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(snapshotRef.current))
      } catch {
        return
      }
    }
    const handleScroll = () => {
      snapshotRef.current.scrollY = window.scrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('pagehide', save)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('pagehide', save)
      save()
    }
  }, [restored, storageKey])

  return !restored
}
