import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CancelIcon } from '@hashi/hds-icons'

import { useBodyScrollLock } from '../../shared/useBodyScrollLock'
import { useFocusTrap } from '../../shared/useFocusTrap'
import { cn } from '../../utils'

export type BottomSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
  showHandle?: boolean
  showCloseButton?: boolean
  'aria-label'?: string
}

const useBottomSheetPresence = (open: boolean) => {
  const [isMounted, setIsMounted] = useState(open)

  useEffect(() => {
    if (open) {
      setIsMounted(true)
    }
  }, [open])

  const unmountAfterClose = () => {
    if (!open) {
      setIsMounted(false)
    }
  }

  return {
    isMounted,
    unmountAfterClose,
  }
}

export const BottomSheet = ({
  open,
  onOpenChange,
  title,
  children,
  footer,
  showHandle = true,
  showCloseButton = true,
  className,
  'aria-label': ariaLabel = '바텀시트',
}: BottomSheetProps) => {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const { isMounted, unmountAfterClose } = useBottomSheetPresence(open)
  const handlePressClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])
  const handleKeyDown = useFocusTrap({
    enabled: open,
    containerRef: panelRef,
    onEscape: handlePressClose,
  })

  useBodyScrollLock(open)

  if (!isMounted || typeof document === 'undefined') {
    return null
  }

  const hasHeader = showHandle || title || showCloseButton
  const overlayAnimationClass = open
    ? 'animate-bottom-sheet-overlay-in'
    : 'animate-bottom-sheet-overlay-out'
  const panelAnimationClass = open
    ? 'animate-bottom-sheet-panel-in'
    : 'animate-bottom-sheet-panel-out'

  const handleAnimationEnd = () => {
    if (open) {
      return
    }

    unmountAfterClose()
  }

  return createPortal(
    <div
      className={cn(
        'z-overlay bg-dim/50 fixed inset-y-0 right-0 left-0 mx-auto flex w-full max-w-(--app-mobile-max-width,100%) items-end',
        overlayAnimationClass,
      )}
      onClick={handlePressClose}
    >
      <div
        aria-label={title ? undefined : ariaLabel}
        aria-labelledby={title ? titleId : undefined}
        aria-modal="true"
        className={cn(
          'relative w-full rounded-t-[20px] bg-white pb-(--safe-area-bottom,0px) will-change-transform outline-none',
          panelAnimationClass,
          className,
        )}
        onClick={(event) => {
          event.stopPropagation()
        }}
        onKeyDown={handleKeyDown}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) {
            handleAnimationEnd()
          }
        }}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        {hasHeader && (
          <div className="relative flex min-h-12.75 items-center justify-center px-5 pt-4">
            {showHandle && (
              <span
                aria-hidden="true"
                className="bg-warm-gray-100 absolute top-2 left-1/2 h-px w-6.75 -translate-x-1/2 rounded-full"
              />
            )}
            {title && (
              <h2 id={titleId} className="typo-sub-header-3 text-black">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                aria-label="닫기"
                className="absolute top-5.5 right-5 flex size-6 items-center justify-center"
                onClick={handlePressClose}
                type="button"
              >
                <CancelIcon aria-hidden="true" className="size-6" />
              </button>
            )}
          </div>
        )}
        <div className="px-5">{children}</div>
        {footer && <div className="px-5 pt-4 pb-5">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
