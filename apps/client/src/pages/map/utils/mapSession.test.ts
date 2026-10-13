import { beforeEach, expect, it } from 'vitest'
import {
  clearMapSession,
  writeMapSession,
  readMapSession,
  leaveMapSession,
  enterMapSession,
} from '@/pages/map/utils/mapSession'
import type { MapSessionSnapshot } from '@/pages/map/types'
const snapshot: MapSessionSnapshot = {
  conditions: {
    keyword: 'sushi',
    category: 'cafe',
    sort: 'rating',
    areaCode: null,
  },
  searchBounds: null,
  camera: null,
  restaurants: [],
  selectedId: null,
  stage: 'expanded',
  detailStage: 'normal',
  isExploring: true,
}
beforeEach(clearMapSession)
it('restores before five minutes but expires exactly at five minutes', () => {
  writeMapSession(snapshot)
  leaveMapSession(1000)
  expect(readMapSession(300999)).toEqual(snapshot)
  expect(readMapSession(301000)).toBeNull()
})
it('does not extend expiry for repeated leave or snapshot updates', () => {
  writeMapSession(snapshot)
  leaveMapSession(1000)
  leaveMapSession(2000)
  writeMapSession({ ...snapshot, stage: 'normal' })
  expect(readMapSession(301000)).toBeNull()
})
it('starts a new inactivity window after a valid return', () => {
  writeMapSession(snapshot)
  leaveMapSession(1000)
  expect(enterMapSession(2000)).toEqual(snapshot)
  leaveMapSession(10000)
  expect(readMapSession(309999)).toEqual(snapshot)
  expect(enterMapSession(310000)).toBeNull()
})
