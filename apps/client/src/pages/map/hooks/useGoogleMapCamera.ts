import { useMap } from '@vis.gl/react-google-maps'
import { useEffect, useRef, useState } from 'react'
import type {
  MapAreaMarkerData,
  MapPosition,
  MapCameraSnapshot,
  MapBounds,
} from '@/pages/map/types'

export const useGoogleMapCamera = (
  areas: MapAreaMarkerData[],
  areaPosition: MapPosition | undefined,
  selectedPosition: MapPosition | undefined,
  resetVersion: number,
  cameraRequest?: MapCameraSnapshot | null,
  searchPositions?: MapPosition[] | null,
  initialBounds?: MapBounds,
  areaBounds?: MapBounds,
  initialFitEnabled = true,
) => {
  const map = useMap()
  const userMoved = useRef(false)
  const programmaticMove = useRef(true)
  const minimumZoom = useRef<number | null>(null)
  const restoredMinimumZoom = useRef(cameraRequest?.minZoom)
  const completedFit = useRef<string | null>(null)
  const [overviewReady, setOverviewReady] = useState(false)
  const overviewBounds =
    initialBounds ??
    (areas.length
      ? {
          north: Math.max(...areas.map(({ position }) => position.lat)),
          south: Math.min(...areas.map(({ position }) => position.lat)),
          east: Math.max(...areas.map(({ position }) => position.lng)),
          west: Math.min(...areas.map(({ position }) => position.lng)),
        }
      : undefined)
  const { north, south, east, west } = overviewBounds ?? {}
  const fitBounds = (
    bounds: MapBounds,
    top: number,
    bottom = 64,
    side = 40,
  ) => {
    if (!map) return
    const { clientWidth: width, clientHeight: height } = map.getDiv()
    map.fitBounds(bounds, {
      top: height > 0 ? Math.min(top, Math.floor(height * 0.4)) : top,
      bottom: height > 0 ? Math.min(bottom, Math.floor(height * 0.1)) : bottom,
      left: width > 0 ? Math.min(side, Math.floor(width * 0.15)) : side,
      right: width > 0 ? Math.min(side, Math.floor(width * 0.15)) : side,
    })
  }
  useEffect(() => {
    if (
      !map ||
      north === undefined ||
      south === undefined ||
      east === undefined ||
      west === undefined
    )
      return
    const fitKey = JSON.stringify([north, south, east, west, resetVersion])
    if (completedFit.current === fitKey) return
    // Fitting into the 12px map strip behind an expanded list would record a
    // world-scale minimum zoom. Wait until the map has usable space again.
    if (!initialFitEnabled && minimumZoom.current === null) return
    userMoved.current = false
    programmaticMove.current = true
    const listener = map.addListener('idle', () => {
      completedFit.current = fitKey
      if (minimumZoom.current === null) {
        const zoom = map.getZoom()
        if (zoom !== undefined) {
          minimumZoom.current = restoredMinimumZoom.current ?? zoom
          map.setOptions({ minZoom: minimumZoom.current })
          setOverviewReady(true)
        }
      }
      listener.remove()
    })
    fitBounds({ north, south, east, west }, 170, 64, 60)
    return () => listener.remove()
  }, [map, north, south, east, west, resetVersion, initialFitEnabled])
  useEffect(() => {
    if (!map || !overviewReady || !areaPosition) return
    userMoved.current = false
    programmaticMove.current = true
    if (areaBounds) {
      fitBounds(areaBounds, 140)
      return
    }
    map.moveCamera({ center: areaPosition, zoom: 15 })
  }, [map, overviewReady, areaPosition, areaBounds])
  useEffect(() => {
    if (!map || !overviewReady || !selectedPosition) return
    userMoved.current = false
    programmaticMove.current = true
    map.panTo(selectedPosition)
    if ((map.getZoom() ?? 0) < 15) map.setZoom(15)
  }, [map, overviewReady, selectedPosition])
  useEffect(() => {
    if (!map || !overviewReady || !cameraRequest) return
    userMoved.current = false
    programmaticMove.current = true
    map.moveCamera({
      center: cameraRequest.center,
      zoom: Math.max(minimumZoom.current ?? 0, cameraRequest.zoom),
    })
  }, [map, overviewReady, cameraRequest])
  useEffect(() => {
    if (!map || !overviewReady || !searchPositions?.length) return
    userMoved.current = false
    programmaticMove.current = true
    if (searchPositions.length === 1) {
      map.moveCamera({ center: searchPositions[0], zoom: 15 })
      return
    }
    fitBounds(
      {
        north: Math.max(...searchPositions.map((p) => p.lat)),
        south: Math.min(...searchPositions.map((p) => p.lat)),
        east: Math.max(...searchPositions.map((p) => p.lng)),
        west: Math.min(...searchPositions.map((p) => p.lng)),
      },
      140,
      50,
    )
  }, [map, overviewReady, searchPositions])
  return { userMoved, programmaticMove, minimumZoom }
}
