import { useEffect, useLayoutEffect, useRef } from 'react'
import type { MapSessionSnapshot } from '@/pages/map/types'
import {
  enterMapSession,
  leaveMapSession,
  writeMapSession,
} from '@/pages/map/utils/mapSession'

export const useMapSession = (
  snapshot: MapSessionSnapshot,
  onExpired: () => void,
) => {
  const latest = useRef({ snapshot, onExpired })
  useLayoutEffect(() => {
    latest.current = { snapshot, onExpired }
    writeMapSession(snapshot)
  })
  useEffect(() => {
    enterMapSession()
    const leave = () => {
      writeMapSession(latest.current.snapshot)
      leaveMapSession()
    }
    const resume = () => {
      if (!enterMapSession()) latest.current.onExpired()
    }
    const visibility = () => {
      if (document.hidden) leave()
      else resume()
    }
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('pagehide', leave)
    window.addEventListener('pageshow', resume)
    return () => {
      leave()
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('pagehide', leave)
      window.removeEventListener('pageshow', resume)
    }
  }, [])
}
