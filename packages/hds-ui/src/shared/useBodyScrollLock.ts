import { useEffect } from 'react'

export const useBodyScrollLock = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return

    const scrollY = window.scrollY
    const {
      left,
      overflow: bodyOverflow,
      position,
      right,
      top,
      width,
    } = document.body.style
    const { overflow: documentOverflow } = document.documentElement.style

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'

    return () => {
      document.documentElement.style.overflow = documentOverflow
      document.body.style.overflow = bodyOverflow
      document.body.style.position = position
      document.body.style.top = top
      document.body.style.left = left
      document.body.style.right = right
      document.body.style.width = width
      if (scrollY > 0) {
        window.scrollTo(0, scrollY)
      }
    }
  }, [enabled])
}
