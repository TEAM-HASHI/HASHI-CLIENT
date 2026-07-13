import { useCallback, useEffect, useRef, useState } from 'react'

type UseIntersectionObserverParams = {
  enabled: boolean
  onIntersect: () => void | Promise<unknown>
  root?: Element | Document | null
  rootMargin?: string
  threshold?: number | number[]
}

export const useIntersectionObserver = <TElement extends Element>({
  enabled,
  onIntersect,
  root = null,
  rootMargin = '160px',
  threshold = 0,
}: UseIntersectionObserverParams) => {
  const [target, setTarget] = useState<TElement | null>(null)
  const onIntersectRef = useRef(onIntersect)
  const isIntersectingRef = useRef(false)

  useEffect(() => {
    onIntersectRef.current = onIntersect
  }, [onIntersect])

  useEffect(() => {
    if (!enabled || !target || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return
        }

        if (isIntersectingRef.current) {
          return
        }

        isIntersectingRef.current = true

        Promise.resolve(onIntersectRef.current()).finally(() => {
          isIntersectingRef.current = false
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
  }, [enabled, root, rootMargin, target, threshold])

  return useCallback((node: TElement | null) => {
    setTarget(node)
  }, [])
}
