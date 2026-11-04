import { useLayoutEffect, useRef, useState } from 'react'
import { DRAG_PANEL_HEIGHTS } from '@hashi/hds-ui'

export const getMapPanelMaxHeight = (availableHeight: number) =>
  Math.min(DRAG_PANEL_HEIGHTS.maximum, Math.max(30, availableHeight - 120))

// Measure the page-owned viewport, never DragPanel's private scroll element.
export const useMapPanelLayout = () => {
  const containerRef = useRef<HTMLElement>(null)
  const [availableHeight, setAvailableHeight] = useState(0)

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return
    const measure = () =>
      setAvailableHeight(element.getBoundingClientRect().height)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return { containerRef, availableHeight }
}
