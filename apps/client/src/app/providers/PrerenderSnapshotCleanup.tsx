import { useLayoutEffect } from 'react'

export const PrerenderSnapshotCleanup = () => {
  useLayoutEffect(() => {
    document.querySelector('[data-hashi-seo-snapshot]')?.remove()
  }, [])

  return null
}
