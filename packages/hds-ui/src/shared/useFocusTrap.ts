import type { KeyboardEvent, RefObject } from 'react'
import { useCallback, useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

type UseFocusTrapParams<TElement extends HTMLElement> = {
  enabled: boolean
  containerRef: RefObject<TElement | null>
  onEscape: () => void
}

const getFocusableElements = (element: HTMLElement) => {
  return Array.from(element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}

export const useFocusTrap = <TElement extends HTMLElement>({
  enabled,
  containerRef,
  onEscape,
}: UseFocusTrapParams<TElement>) => {
  const previousFocusedElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const animationFrameId = window.requestAnimationFrame(() => {
      containerRef.current?.focus()
    })

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      previousFocusedElementRef.current?.focus()
      previousFocusedElementRef.current = null
    }
  }, [enabled, containerRef])

  return useCallback(
    (event: KeyboardEvent<TElement>) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onEscape()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const containerElement = containerRef.current
      if (!containerElement) return

      const focusableElements = getFocusableElements(containerElement)

      if (focusableElements.length === 0) {
        event.preventDefault()
        containerElement.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
        return
      }

      if (
        event.shiftKey &&
        activeElement !== null &&
        activeElement === containerElement
      ) {
        event.preventDefault()
        lastElement.focus()
        return
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    },
    [containerRef, onEscape],
  )
}
