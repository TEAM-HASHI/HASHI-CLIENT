import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react'

import { cn } from '../../utils'

const HANDLE_HEIGHT = 30
const DRAG_DEAD_ZONE = 12

export type DragPanelProps = {
  height: number
  normalHeight: number
  maxHeight: number
  onHeightChange: (height: number) => void
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  className?: string
  'aria-label': string
  handleLabel: string
}

export const DragPanel = ({
  height,
  normalHeight,
  maxHeight,
  onHeightChange,
  children,
  header,
  footer,
  className,
  'aria-label': ariaLabel,
  handleLabel,
}: DragPanelProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const scrollTop = useRef(0)

  const gesture = useRef<{
    pointerId: number
    startY: number
    startHeight: number
  } | null>(null)

  const [dragHeight, setDragHeight] = useState<number | null>(null)
  const contentId = useId()
  const [availableHeight, setAvailableHeight] = useState(maxHeight)
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

  const maximum = Math.max(0, Math.min(maxHeight, availableHeight))
  const minimum = Math.min(HANDLE_HEIGHT, maximum)

  const clamp = (value: number) => Math.min(maximum, Math.max(minimum, value))

  const currentHeight = clamp(dragHeight ?? height)

  const stages = [...new Set([minimum, clamp(normalHeight), maximum])].sort(
    (a, b) => a - b,
  )

  const getClosestStageIndex = (value: number) =>
    stages.reduce(
      (bestIndex, stage, index) =>
        Math.abs(stage - value) < Math.abs(stages[bestIndex] - value)
          ? index
          : bestIndex,
      0,
    )

  const getTargetStage = (
    startHeight: number,
    finalHeight: number,
    direction: 'up' | 'down',
  ) => {
    const startIndex = getClosestStageIndex(startHeight)

    if (direction === 'up') {
      let targetIndex = Math.min(startIndex + 1, stages.length - 1)

      while (
        targetIndex < stages.length - 1 &&
        finalHeight >= stages[targetIndex] + DRAG_DEAD_ZONE
      ) {
        targetIndex += 1
      }

      return stages[targetIndex]
    }

    let targetIndex = Math.max(startIndex - 1, 0)

    while (
      targetIndex > 0 &&
      finalHeight <= stages[targetIndex] - DRAG_DEAD_ZONE
    ) {
      targetIndex -= 1
    }

    return stages[targetIndex]
  }
  const collapsed = currentHeight <= HANDLE_HEIGHT

  useLayoutEffect(() => {
    if (collapsed && bodyRef.current?.contains(document.activeElement)) {
      handleRef.current?.focus({ preventScroll: true })
    }

    if (!collapsed && contentRef.current) {
      contentRef.current.scrollTop = scrollTop.current
    }
  }, [collapsed])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let nextHeight: number

    switch (event.key) {
      case 'Home':
        nextHeight = minimum
        break

      case 'End':
        nextHeight = maximum
        break

      case 'ArrowUp':
        nextHeight = stages.find((stage) => stage > currentHeight) ?? maximum
        break

      case 'ArrowDown':
        nextHeight =
          stages.filter((stage) => stage < currentHeight).at(-1) ?? minimum
        break

      default:
        return
    }

    event.preventDefault()
    onHeightChange(Math.min(maximum, Math.max(minimum, nextHeight)))
  }

  const dragPosition = (clientY: number) => {
    const active = gesture.current

    return active
      ? clamp(active.startHeight + active.startY - clientY)
      : currentHeight
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0 || gesture.current) return

    event.preventDefault()
    event.currentTarget.focus()
    event.currentTarget.setPointerCapture?.(event.pointerId)

    gesture.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: currentHeight,
    }

    setDragHeight(currentHeight)
  }

  const finishDrag = (
    event: PointerEvent<HTMLDivElement>,
    cancelled: boolean,
  ) => {
    const active = gesture.current

    if (!active || active.pointerId !== event.pointerId) return

    const deltaY = active.startY - event.clientY
    const distance = Math.abs(deltaY)
    const finalHeight = dragPosition(event.clientY)

    gesture.current = null
    setDragHeight(null)

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (cancelled) return

    if (distance < DRAG_DEAD_ZONE) {
      onHeightChange(stages[getClosestStageIndex(active.startHeight)])
      return
    }

    const direction = deltaY > 0 ? 'up' : 'down'

    onHeightChange(getTargetStage(active.startHeight, finalHeight, direction))
  }

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <section
        aria-label={ariaLabel}
        className={cn(
          'animate-bottom-sheet-panel-in pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[20px] bg-white',
          dragHeight === null &&
            'transition-[height] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          className,
        )}
        style={{ height: currentHeight, bottom: bottomInset }}
      >
        <div
          ref={handleRef}
          role="slider"
          aria-label={handleLabel}
          aria-controls={contentId}
          aria-orientation="vertical"
          aria-valuemin={minimum}
          aria-valuemax={maximum}
          aria-valuenow={currentHeight}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={(event) => {
            if (gesture.current?.pointerId === event.pointerId) {
              setDragHeight(dragPosition(event.clientY))
            }
          }}
          onPointerUp={(event) => finishDrag(event, false)}
          onPointerCancel={(event) => finishDrag(event, true)}
          onLostPointerCapture={(event) => finishDrag(event, true)}
          className="relative h-7.5 shrink-0 cursor-ns-resize touch-none select-none focus-visible:outline-2 focus-visible:-outline-offset-2"
        >
          <span
            aria-hidden="true"
            className="absolute top-3 left-1/2 h-1.25 w-16.75 -translate-x-1/2 rounded-full bg-[#d9d9d9]"
          />
        </div>

        <div
          ref={bodyRef}
          id={contentId}
          inert={collapsed}
          aria-hidden={collapsed || undefined}
          className={cn(
            'flex min-h-0 flex-1 flex-col',
            collapsed && 'invisible',
          )}
        >
          {header && <div className="shrink-0">{header}</div>}

          <div
            ref={contentRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
            onScroll={(event) => {
              if (!collapsed) {
                scrollTop.current = event.currentTarget.scrollTop
              }
            }}
          >
            {children}
          </div>

          {footer && <div className="shrink-0">{footer}</div>}
        </div>
      </section>
    </div>
  )
}
