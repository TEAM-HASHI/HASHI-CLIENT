import { useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'

import type {
  DragPanelProps,
  DragPanelStage,
  DragPanelStageCommit,
} from './DragPanel'
import { usePanelViewport } from './usePanelViewport'
import { usePanelContentGesture } from './usePanelContentGesture'

const HANDLE_HEIGHT = 30
const DRAG_DEAD_ZONE = 12
const STAGE_NAMES: DragPanelStage[] = ['collapsed', 'normal', 'maximum']

type UseDragPanelOptions = Pick<
  DragPanelProps,
  'height' | 'stage' | 'onHeightChange' | 'onStageCommit'
> & { normalHeight: number; maxHeight?: number }

export const useDragPanel = ({
  height,
  stage,
  normalHeight,
  maxHeight,
  onHeightChange,
  onStageCommit,
}: UseDragPanelOptions) => {
  const { containerRef, availableHeight, bottomInset } = usePanelViewport(
    maxHeight ?? normalHeight,
  )
  const contentRef = useRef<HTMLDivElement>(null)
  const [committedStage, setCommittedStage] = useState<{
    index: number
    height: number
  } | null>(null)

  const gesture = useRef<{
    pointerId: number
    startY: number
    startHeight: number
    startIndex: number
  } | null>(null)

  const [dragHeight, setDragHeight] = useState<number | null>(null)

  const maximum = Math.max(0, Math.min(maxHeight ?? Infinity, availableHeight))
  const minimum = Math.min(HANDLE_HEIGHT, maximum)

  const clamp = (value: number) => Math.min(maximum, Math.max(minimum, value))
  const clampedHeight = clamp(height)
  const clampedNormalHeight = clamp(normalHeight)

  const semanticStages = [minimum, clampedNormalHeight, maximum]
  const committed = committedStage?.height === height ? committedStage : null
  const committedHeight = committed ? semanticStages[committed.index] : height
  const explicitIndex =
    stage === undefined ? committed?.index : STAGE_NAMES.indexOf(stage)
  const fullscreen =
    maxHeight === undefined &&
    (explicitIndex !== undefined
      ? explicitIndex === 2
      : maximum > clampedNormalHeight && clampedHeight === maximum)
  const settledHeight =
    explicitIndex !== undefined ? semanticStages[explicitIndex] : clampedHeight
  const currentHeight = clamp(dragHeight ?? settledHeight)

  const getSemanticIndex = () => {
    if (explicitIndex !== undefined) return explicitIndex
    return semanticStages.reduce(
      (best, value, index) =>
        Math.abs(value - clampedHeight) <
        Math.abs(semanticStages[best] - clampedHeight)
          ? index
          : best,
      0,
    )
  }

  const commit = (index: number, input: DragPanelStageCommit['input']) => {
    const previous = getSemanticIndex()
    const next = semanticStages[index]
    if (stage === undefined)
      setCommittedStage((current) =>
        current?.index === index && current.height === next
          ? current
          : { index, height: next },
      )
    onHeightChange?.(next)
    if (index !== previous && maximum > minimum) {
      onStageCommit?.({ stage: STAGE_NAMES[index], height: next, input })
    }
  }

  const resetPull = usePanelContentGesture({
    contentRef,
    canExpand: settledHeight > minimum && settledHeight < maximum,
    canCollapse: getSemanticIndex() === 2,
    height: settledHeight,
    maximum,
    normalHeight: clampedNormalHeight,
    deadZone: DRAG_DEAD_ZONE,
    onDragHeightChange: setDragHeight,
    onCollapse: () => commit(1, 'pointer'),
    onExpand: () => commit(2, 'pointer'),
  })

  useLayoutEffect(() => {
    if (
      stage === undefined &&
      committed &&
      committedHeight !== height &&
      onHeightChange
    ) {
      setCommittedStage({ ...committed, height: committedHeight })
      onHeightChange(committedHeight)
    } else if (committedStage && !committed) setCommittedStage(null)
    gesture.current = null
    resetPull()
  }, [
    height,
    stage,
    normalHeight,
    minimum,
    maximum,
    bottomInset,
    maxHeight,
    committedStage,
    committed,
    committedHeight,
    onHeightChange,
    resetPull,
  ])

  const collapsed = currentHeight <= HANDLE_HEIGHT

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = getSemanticIndex()
    const onStage = semanticStages[index] === currentHeight
    const targets: Record<string, number> = {
      Home: 0,
      End: 2,
      ArrowUp: onStage
        ? Math.min(index + 1, 2)
        : semanticStages.findIndex((value) => value > currentHeight),
      ArrowDown: onStage
        ? Math.max(index - 1, 0)
        : semanticStages.reduce(
            (previous, value, index) =>
              value < currentHeight ? index : previous,
            0,
          ),
    }
    const next = targets[event.key]
    if (next === undefined) return
    event.preventDefault()
    if (!event.repeat) commit(next, 'keyboard')
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
      startIndex: getSemanticIndex(),
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

    if (cancelled || distance < DRAG_DEAD_ZONE) return

    const up = deltaY > 0
    let index = Math.max(0, Math.min(2, active.startIndex + (up ? 1 : -1)))
    while (
      up
        ? index < 2 && finalHeight >= semanticStages[index] + DRAG_DEAD_ZONE
        : index > 0 && finalHeight <= semanticStages[index] - DRAG_DEAD_ZONE
    )
      index += up ? 1 : -1
    commit(index, 'pointer')
  }

  return {
    containerRef,
    contentRef,
    bottomInset,
    minimum,
    maximum,
    currentHeight,
    fullscreen,
    collapsed,
    isDragging: dragHeight !== null,
    collapse: () => commit(1, 'button'),
    handleProps: {
      onKeyDown: handleKeyDown,
      onPointerDown: handlePointerDown,
      onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
        if (gesture.current?.pointerId === event.pointerId) {
          setDragHeight(dragPosition(event.clientY))
        }
      },
      onPointerUp: (event: PointerEvent<HTMLDivElement>) =>
        finishDrag(event, false),
      onPointerCancel: (event: PointerEvent<HTMLDivElement>) =>
        finishDrag(event, true),
      onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) =>
        finishDrag(event, true),
    },
  }
}
