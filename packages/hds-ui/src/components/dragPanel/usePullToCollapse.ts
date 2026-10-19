import { useCallback, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'

type UsePullToCollapseOptions = {
  contentRef: RefObject<HTMLDivElement | null>
  enabled: boolean
  maximum: number
  normalHeight: number
  deadZone: number
  onDragHeightChange: (height: number | null) => void
  onCollapse: () => void
}

export const usePullToCollapse = ({
  contentRef,
  enabled,
  maximum,
  normalHeight,
  deadZone,
  onDragHeightChange,
  onCollapse,
}: UsePullToCollapseOptions) => {
  const wheelDistance = useRef(0)
  const pull = useRef<{
    id: number
    x: number
    y: number
    active: boolean
    distance: number
  } | null>(null)
  const onCollapseRef = useRef(onCollapse)
  useLayoutEffect(() => {
    onCollapseRef.current = onCollapse
  })

  const resetPull = useCallback(() => {
    pull.current = null
    wheelDistance.current = 0
    onDragHeightChange(null)
  }, [onDragHeightChange])

  useLayoutEffect(() => {
    const content = contentRef.current
    if (!content || !enabled) return

    const start = (event: TouchEvent) => {
      onDragHeightChange(null)
      const touch = event.touches[0]
      pull.current =
        event.touches.length === 1 && content.scrollTop <= 0
          ? {
              id: touch.identifier,
              x: touch.clientX,
              y: touch.clientY,
              active: false,
              distance: 0,
            }
          : null
    }
    const move = (event: TouchEvent) => {
      const active = pull.current
      if (!active) return
      const touch = event.touches[0]
      if (
        event.touches.length !== 1 ||
        touch.identifier !== active.id ||
        !event.cancelable
      ) {
        pull.current = null
        onDragHeightChange(null)
        return
      }
      const delta = touch.clientY - active.y
      if (!active.active) {
        if (Math.abs(touch.clientX - active.x) > deadZone || delta < 0) {
          pull.current = null
          return
        }
        if (delta < deadZone) return
        active.active = true
      }
      event.preventDefault()
      active.distance = delta
      onDragHeightChange(Math.max(normalHeight, maximum - Math.max(0, delta)))
    }
    const finish = (event: TouchEvent) => {
      const active = pull.current
      pull.current = null
      onDragHeightChange(null)
      if (
        active?.active &&
        active.distance >= deadZone &&
        event.type === 'touchend'
      )
        onCollapseRef.current()
    }
    const wheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        content.scrollTop > 0 ||
        event.deltaY >= 0 ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX) ||
        !event.cancelable
      ) {
        wheelDistance.current = 0
        return
      }
      event.preventDefault()
      const unit =
        event.deltaMode === 1
          ? parseFloat(getComputedStyle(content).lineHeight) || 16
          : event.deltaMode === 2
            ? content.clientHeight
            : 1
      wheelDistance.current -= event.deltaY * unit
      if (wheelDistance.current >= deadZone) {
        wheelDistance.current = 0
        onCollapseRef.current()
      }
    }
    content.addEventListener('touchstart', start, { passive: true })
    content.addEventListener('touchmove', move, { passive: false })
    content.addEventListener('touchend', finish)
    content.addEventListener('touchcancel', finish)
    content.addEventListener('wheel', wheel, { passive: false })
    return () => {
      content.removeEventListener('touchstart', start)
      content.removeEventListener('touchmove', move)
      content.removeEventListener('touchend', finish)
      content.removeEventListener('touchcancel', finish)
      content.removeEventListener('wheel', wheel)
    }
  }, [contentRef, enabled, maximum, normalHeight, deadZone, onDragHeightChange])

  return resetPull
}
