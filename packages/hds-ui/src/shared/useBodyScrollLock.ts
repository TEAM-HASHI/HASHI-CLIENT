import { useEffect } from 'react'

export const useBodyScrollLock = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = overflow
    }
  }, [enabled])
}
