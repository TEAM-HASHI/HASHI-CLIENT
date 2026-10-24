import { useCallback, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'

type UsePanelContentGestureOptions = {
  contentRef: RefObject<HTMLDivElement | null>
  canExpand: boolean
  canCollapse: boolean
  height: number
  maximum: number
  normalHeight: number
  deadZone: number
  onDragHeightChange: (height: number | null) => void
  onCollapse: () => void
  onExpand: () => void
}

export const usePanelContentGesture = ({
  contentRef,
  canExpand,
  canCollapse,
  height,
  maximum,
  normalHeight,
  deadZone,
  onDragHeightChange,
  onCollapse,
  onExpand,
}: UsePanelContentGestureOptions) => {
  const wheelDistance = useRef(0)
  const pull = useRef<{
    id: number
    x: number
    y: number
    active: boolean
    distance: number
    atTop: boolean
  } | null>(null)
  const callbacks = useRef({ onCollapse, onExpand })
  useLayoutEffect(() => {
    callbacks.current = { onCollapse, onExpand }
  })

  const resetPull = useCallback(() => {
    pull.current = null
    wheelDistance.current = 0
    onDragHeightChange(null)
  }, [onDragHeightChange])

  useLayoutEffect(() => {
    const content = contentRef.current
    if (!content || (!canExpand && !canCollapse)) return

    const isAtTop = (target: EventTarget | null) => {
      let node = target instanceof Element ? target : null
      while (node && content.contains(node)) {
        if (node.scrollTop > 0) return false
        if (node === content) break
        node = node.parentElement
      }
      return content.scrollTop <= 0
    }

    const start = (event: TouchEvent) => {
      onDragHeightChange(null)
      const touch = event.touches[0]
      pull.current =
        event.touches.length === 1
          ? {
              id: touch.identifier,
              x: touch.clientX,
              y: touch.clientY,
              active: false,
              distance: 0,
              atTop: isAtTop(event.target),
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
        if (Math.abs(touch.clientX - active.x) > deadZone) {
          pull.current = null
          return
        }
        if (Math.abs(delta) < deadZone) return
        if (delta < 0 ? !canExpand : !canCollapse || !active.atTop) {
          pull.current = null
          return
        }
        active.active = true
      }
      event.preventDefault()
      active.distance = delta
      onDragHeightChange(
        Math.min(maximum, Math.max(normalHeight, height - delta)),
      )
    }
    const finish = (event: TouchEvent) => {
      const active = pull.current
      pull.current = null
      onDragHeightChange(null)
      if (
        active?.active &&
        Math.abs(active.distance) >= deadZone &&
        (active.distance < 0 ? canExpand : canCollapse && active.atTop) &&
        event.type === 'touchend'
      )
        (active.distance < 0
          ? callbacks.current.onExpand
          : callbacks.current.onCollapse)()
    }
    const wheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        (event.deltaY > 0
          ? !canExpand
          : !canCollapse || !isAtTop(event.target)) ||
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
      if (Math.sign(wheelDistance.current) !== Math.sign(event.deltaY))
        wheelDistance.current = 0
      wheelDistance.current += event.deltaY * unit
      if (Math.abs(wheelDistance.current) >= deadZone) {
        wheelDistance.current = 0
        if (event.deltaY > 0) callbacks.current.onExpand()
        else callbacks.current.onCollapse()
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
  }, [
    contentRef,
    canExpand,
    canCollapse,
    height,
    maximum,
    normalHeight,
    deadZone,
    onDragHeightChange,
  ])

  return resetPull
}
