import { useLayoutEffect, useRef, useState } from 'react'

export const usePanelViewport = (initialHeight: number) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [availableHeight, setAvailableHeight] = useState(initialHeight)
  const [bottomInset, setBottomInset] = useState(0)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const measure = () => {
      const rect = container.getBoundingClientRect()
      const viewport = window.visualViewport
      const visibleBottom = viewport
        ? viewport.offsetTop + viewport.height
        : window.innerHeight

      setAvailableHeight(
        Math.max(0, Math.min(rect.height, visibleBottom - rect.top)),
      )

      setBottomInset(Math.max(0, rect.bottom - visibleBottom))
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(container)

    window.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('resize', measure)
    window.visualViewport?.addEventListener('scroll', measure)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('resize', measure)
      window.visualViewport?.removeEventListener('scroll', measure)
    }
  }, [])

  return { containerRef, availableHeight, bottomInset }
}
