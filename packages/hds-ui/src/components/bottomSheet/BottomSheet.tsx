import type { ReactNode } from 'react'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { CancelIcon } from '@hashi/hds-icons'

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
}

const useBottomSheetPresence = (open: boolean) => {
  const [isMounted, setIsMounted] = useState(open)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!open) {
      setIsVisible(false)
      return
    }
    setIsMounted(true)

    const animationFrameId = window.requestAnimationFrame(() => {
      setIsVisible(true)
    })

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [open])

  const unmountAfterClose = () => {
    if (!open) {
      setIsMounted(false)
    }
  }

  return {
    isMounted,
    isVisible,
    unmountAfterClose,
  }
}

const useBodyScrollLock = (open: boolean) => {
  useEffect(() => {
    if (!open) return

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = overflow
    }
  }, [open])
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
}: BottomSheetProps) => {
  const titleId = useId()
  const { isMounted, isVisible, unmountAfterClose } =
    useBottomSheetPresence(open)

  useBodyScrollLock(open)

  if (!isMounted || typeof document === 'undefined') {
    return null
  }

  const hasHeader = showHandle || title || showCloseButton

  const handlePressClose = () => {
    onOpenChange(false)
  }

  const handleTransitionEnd = () => {
    if (open) {
      return
    }

    unmountAfterClose()
  }

  return createPortal(
    <div
      className="fixed inset-y-0 right-0 left-0 z-50 mx-auto flex w-full max-w-[var(--app-mobile-max-width,100%)] items-end bg-black/50"
      onClick={handlePressClose}
    >
      <div
        aria-labelledby={title ? titleId : undefined}
        aria-modal="true"
        className={cn(
          'relative w-full rounded-t-[20px] bg-white pb-[var(--safe-area-bottom,0px)] transition-transform duration-200 ease-out',
          isVisible ? 'translate-y-0' : 'translate-y-full',
          className,
        )}
        onClick={(event) => {
          event.stopPropagation()
        }}
        onTransitionEnd={handleTransitionEnd}
        role="dialog"
      >
        {hasHeader && (
          <div className="relative flex min-h-[51px] items-center justify-center px-5 pt-4">
            {showHandle && (
              <span
                aria-hidden="true"
                className="bg-warm-gray-100 absolute top-2 left-1/2 h-px w-[27px] -translate-x-1/2 rounded-full"
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
                className="absolute top-[22px] right-5 flex size-6 items-center justify-center"
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
