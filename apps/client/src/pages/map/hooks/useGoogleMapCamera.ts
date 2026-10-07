import { useMap } from '@vis.gl/react-google-maps'
import { useEffect, useRef, useState } from 'react'
import type { MapAreaMarkerData, MapPosition } from '@/pages/map/types'

export const useGoogleMapCamera = (
  areas: MapAreaMarkerData[],
  areaPosition: MapPosition | undefined,
  selectedPosition: MapPosition | undefined,
  resetVersion: number,
) => {
  const map = useMap()
  const userMoved = useRef(false)
  const programmaticMove = useRef(true)
  const minimumZoom = useRef<number | null>(null)
  const [overviewReady, setOverviewReady] = useState(false)
  useEffect(() => {
    if (!map || !areas.length) return
    userMoved.current = false
    programmaticMove.current = true
    const bounds = {
      north: Math.max(...areas.map(({ position }) => position.lat)),
      south: Math.min(...areas.map(({ position }) => position.lat)),
      east: Math.max(...areas.map(({ position }) => position.lng)),
      west: Math.min(...areas.map(({ position }) => position.lng)),
    }
    const listener = map.addListener('idle', () => {
      if (minimumZoom.current === null) {
        const zoom = map.getZoom()
        if (zoom !== undefined) {
          minimumZoom.current = zoom
          map.setOptions({ minZoom: zoom })
          setOverviewReady(true)
        }
      }
      listener.remove()
    })
    map.fitBounds(bounds, { top: 170, bottom: 64, left: 60, right: 60 })
    return () => listener.remove()
  }, [map, areas, resetVersion])
  useEffect(() => {
    if (!map || !overviewReady || !areaPosition) return
    userMoved.current = false
    programmaticMove.current = true
    map.moveCamera({ center: areaPosition, zoom: 15 })
  }, [map, overviewReady, areaPosition])
  useEffect(() => {
    if (!map || !overviewReady || !selectedPosition) return
    userMoved.current = false
    programmaticMove.current = true
    map.panTo(selectedPosition)
    if ((map.getZoom() ?? 0) < 15) map.setZoom(15)
  }, [map, overviewReady, selectedPosition])
  return { userMoved, programmaticMove }
}
