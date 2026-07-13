import { useEffect, useRef } from 'react'

interface UseInfiniteScrollTriggerParams {
  enabled: boolean
  isLoading: boolean
  rootMargin?: string
  onIntersect: () => Promise<unknown> | void
}

export const useInfiniteScrollTrigger = <TElement extends Element>({
  enabled,
  isLoading,
  rootMargin = '160px 0px',
  onIntersect,
}: UseInfiniteScrollTriggerParams) => {
  const targetRef = useRef<TElement | null>(null)
  const isLockedRef = useRef(false)

  useEffect(() => {
    if (!isLoading) {
      isLockedRef.current = false
    }
  }, [isLoading])

  useEffect(() => {
    if (!enabled || isLoading || typeof IntersectionObserver === 'undefined') {
      return
    }

    const target = targetRef.current

    if (!target) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || isLockedRef.current) {
          return
        }

        isLockedRef.current = true
        void Promise.resolve(onIntersect()).finally(() => {
          isLockedRef.current = false
        })
      },
      {
        root: null,
        rootMargin,
        threshold: 0,
      },
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [enabled, isLoading, onIntersect, rootMargin])

  return targetRef
}
