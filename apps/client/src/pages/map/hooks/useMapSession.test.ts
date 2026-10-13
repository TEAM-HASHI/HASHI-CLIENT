import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useMapSession } from '@/pages/map/hooks/useMapSession'
import { clearMapSession, readMapSession } from '@/pages/map/utils/mapSession'
import type { MapSessionSnapshot } from '@/pages/map/types'
const snapshot: MapSessionSnapshot = {
  conditions: {
    keyword: '',
    category: 'all',
    areaCode: null,
    sort: 'recommended',
  },
  camera: null,
  searchBounds: null,
  selectedId: null,
  stage: 'normal',
  detailStage: 'normal',
  isExploring: false,
}
afterEach(() => {
  cleanup()
  clearMapSession()
  vi.useRealTimers()
})
it('expires after background inactivity and removes event listeners on unmount', () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const reset = vi.fn()
  const { unmount } = renderHook(() => useMapSession(snapshot, reset))
  act(() => window.dispatchEvent(new Event('pagehide')))
  vi.setSystemTime(301000)
  act(() => window.dispatchEvent(new Event('pageshow')))
  expect(reset).toHaveBeenCalledOnce()
  unmount()
  expect(readMapSession()).toEqual(snapshot)
  act(() => window.dispatchEvent(new Event('pageshow')))
  expect(reset).toHaveBeenCalledOnce()
})
