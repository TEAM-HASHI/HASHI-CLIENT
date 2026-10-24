import { useId, useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import { cn } from '../../utils'
import { useDragPanel } from './useDragPanel'

export const DRAG_PANEL_HEIGHTS = {
  collapsed: 30,
  normal: 321,
  maximum: 710,
} as const

export type DragPanelStage = 'collapsed' | 'normal' | 'maximum'
export type DragPanelStageCommit = {
  stage: DragPanelStage
  height: number
  input: 'pointer' | 'keyboard' | 'button'
}

export type DragPanelRenderState = {
  isFullscreen: boolean
  collapse: () => void
}
type DragPanelSlot = ReactNode | ((state: DragPanelRenderState) => ReactNode)

export type DragPanelProps = {
  height: number
  stage?: DragPanelStage
  normalHeight?: number
  maxHeight?: number | 'fullscreen'
  onHeightChange?: (height: number) => void
  onStageCommit?: (event: DragPanelStageCommit) => void
  children: DragPanelSlot
  header?: DragPanelSlot
  footer?: DragPanelSlot
  floating?: DragPanelSlot
  className?: string
  'aria-label': string
  handleLabel: string
}

export const DragPanel = ({
  height,
  stage,
  normalHeight = DRAG_PANEL_HEIGHTS.normal,
  maxHeight = DRAG_PANEL_HEIGHTS.maximum,
  onHeightChange,
  onStageCommit,
  children,
  header,
  footer,
  floating,
  className,
  'aria-label': ariaLabel,
  handleLabel,
}: DragPanelProps) => {
  const {
    containerRef,
    contentRef,
    bottomInset,
    minimum,
    maximum,
    currentHeight,
    fullscreen,
    collapsed,
    isDragging,
    collapse,
    handleProps,
  } = useDragPanel({
    height,
    stage,
    normalHeight,
    maxHeight: maxHeight === 'fullscreen' ? undefined : maxHeight,
    onHeightChange,
    onStageCommit,
  })
  const bodyRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const wasFullscreen = useRef(false)
  const scrollTop = useRef(0)
  const contentId = useId()

  useLayoutEffect(() => {
    if (
      fullscreen &&
      (document.activeElement === handleRef.current ||
        document.activeElement === document.body)
    ) {
      bodyRef.current?.focus({ preventScroll: true })
    } else if (!fullscreen && wasFullscreen.current) {
      handleRef.current?.focus({ preventScroll: true })
    }
    wasFullscreen.current = fullscreen

    if (collapsed && bodyRef.current?.contains(document.activeElement)) {
      handleRef.current?.focus({ preventScroll: true })
    }

    if (!collapsed && contentRef.current) {
      contentRef.current.scrollTop = scrollTop.current
    }
  }, [collapsed, fullscreen])

  const renderState: DragPanelRenderState = {
    isFullscreen: fullscreen,
    collapse,
  }
  const renderSlot = (slot: DragPanelSlot) =>
    typeof slot === 'function' ? slot(renderState) : slot
  const panelHeader = renderSlot(header)
  const panelFooter = renderSlot(footer)
  const panelFloating = renderSlot(floating)

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <section
        aria-label={ariaLabel}
        className={cn(
          'animate-bottom-sheet-panel-in pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[20px] bg-white',
          !isDragging &&
            'transition-[height] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          className,
        )}
        style={{ height: currentHeight, bottom: bottomInset }}
      >
        <div
          ref={handleRef}
          hidden={fullscreen}
          role="slider"
          aria-label={handleLabel}
          aria-controls={contentId}
          aria-orientation="vertical"
          aria-valuemin={minimum}
          aria-valuemax={maximum}
          aria-valuenow={currentHeight}
          tabIndex={0}
          {...handleProps}
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
          tabIndex={-1}
          inert={collapsed}
          aria-hidden={collapsed || undefined}
          className={cn(
            'flex min-h-0 flex-1 flex-col',
            collapsed && 'invisible',
          )}
        >
          {panelHeader && <div className="shrink-0">{panelHeader}</div>}

          <div
            ref={contentRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
            onScroll={(event) => {
              if (!collapsed) {
                scrollTop.current = event.currentTarget.scrollTop
              }
            }}
          >
            {renderSlot(children)}
          </div>

          {panelFooter && <div className="shrink-0">{panelFooter}</div>}
          {panelFloating && (
            <div className="pointer-events-none absolute inset-0 [&>*]:pointer-events-auto">
              {panelFloating}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
