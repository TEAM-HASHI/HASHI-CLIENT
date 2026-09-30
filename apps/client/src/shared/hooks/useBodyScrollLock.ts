import { useEffect } from 'react'

export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) {
      return
    }

    const previousBodyOverflow = document.body.style.overflow
    const previousBodyPosition = document.body.style.position
    const previousBodyTop = document.body.style.top
    const previousBodyWidth = document.body.style.width
    const previousDocumentOverflow = document.documentElement.style.overflow
    const scrollY = window.scrollY

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.body.style.position = previousBodyPosition
      document.body.style.top = previousBodyTop
      document.body.style.width = previousBodyWidth
      document.documentElement.style.overflow = previousDocumentOverflow
      window.scrollTo({ top: scrollY, behavior: 'auto' })
    }
  }, [isLocked])
}
