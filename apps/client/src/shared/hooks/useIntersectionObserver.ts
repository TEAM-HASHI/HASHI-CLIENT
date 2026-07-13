import { useCallback, useEffect, useRef, useState } from 'react'

type UseIntersectionObserverParams = {
  enabled: boolean
  onIntersect: () => void
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

        onIntersectRef.current()
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
