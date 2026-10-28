import { useEffect, useRef } from 'react'

export const usePageScrollLayout = () => {
  const frameRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const root = document.documentElement
    const bars = new Set<Element>()
    let animationFrame = 0

    const measure = () => {
      let top = 0
      let bottom = 0
      const rects = [...bars]
        .filter((bar) => getComputedStyle(bar).position === 'fixed')
        .map((bar) => bar.getBoundingClientRect())
        .filter((rect) => rect.height > 0)
        .sort((left, right) => left.top - right.top)
      for (const rect of rects) {
        if (rect.top <= top && rect.bottom < window.innerHeight)
          top = Math.max(top, rect.bottom)
        if (rect.bottom >= window.innerHeight && rect.top > 0)
          bottom = Math.max(bottom, window.innerHeight - rect.top)
      }
      root.style.setProperty('--app-content-top', `${top}px`)
      root.style.setProperty('--app-content-bottom', `${bottom}px`)
    }
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(measure)
    const refresh = () => {
      const candidates = frame.querySelectorAll(
        'header, .app-mobile-fixed-top, .app-mobile-fixed-bottom, [data-page-scroll-top]',
      )
      const fixedBars = new Set<Element>()
      for (const candidate of candidates) {
        let bar: Element | null = candidate
        while (bar && bar !== frame) {
          if (getComputedStyle(bar).position === 'fixed') {
            fixedBars.add(bar)
            break
          }
          bar = bar.parentElement
        }
      }
      for (const bar of bars) {
        if (!fixedBars.has(bar)) {
          resizeObserver?.unobserve(bar)
          bars.delete(bar)
        }
      }
      for (const bar of fixedBars) {
        if (!bars.has(bar)) {
          resizeObserver?.observe(bar)
          bars.add(bar)
        }
      }
      measure()
    }
    const mutationObserver = new MutationObserver(() => {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(refresh)
    })
    refresh()
    mutationObserver.observe(frame, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-page-scroll-top'],
    })
    window.addEventListener('resize', measure)

    return () => {
      cancelAnimationFrame(animationFrame)
      mutationObserver.disconnect()
      resizeObserver?.disconnect()
      window.removeEventListener('resize', measure)
      root.style.removeProperty('--app-content-top')
      root.style.removeProperty('--app-content-bottom')
    }
  }, [])

  return frameRef
}
