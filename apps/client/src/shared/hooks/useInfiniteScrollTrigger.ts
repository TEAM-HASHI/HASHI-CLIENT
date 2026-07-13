import { useCallback, useEffect, useRef, useState } from 'react'

interface UseInfiniteScrollTriggerParams {
  enabled: boolean
  isLoading?: boolean
  root?: Element | Document | null
  rootMargin?: string
  threshold?: number | number[]
  onIntersect: () => Promise<unknown> | void
}

export const useInfiniteScrollTrigger = <TElement extends Element>({
  enabled,
  isLoading = false,
  root = null,
  rootMargin = '160px 0px',
  threshold = 0,
  onIntersect,
}: UseInfiniteScrollTriggerParams) => {
  const [target, setTarget] = useState<TElement | null>(null)
  const onIntersectRef = useRef(onIntersect)
  const isLockedRef = useRef(false)

  useEffect(() => {
    onIntersectRef.current = onIntersect
  }, [onIntersect])

  useEffect(() => {
    if (!isLoading) {
      isLockedRef.current = false
    }
  }, [isLoading])

  useEffect(() => {
    if (!enabled || isLoading || typeof IntersectionObserver === 'undefined') {
      return
    }

    if (!target) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || isLockedRef.current) {
          return
        }

        isLockedRef.current = true
        void Promise.resolve(onIntersectRef.current()).finally(() => {
          isLockedRef.current = false
        })
      },
      {
        root,
        rootMargin,
        threshold,
      },
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [enabled, isLoading, root, rootMargin, target, threshold])

  return useCallback((node: TElement | null) => {
    setTarget(node)
  }, [])
}
