import { beforeEach, expect, it, vi } from 'vitest'
import type { MapSessionSnapshot } from '@/pages/map/types'
import { createMapPageFixture } from '@/pages/map/__tests__/mapApiFixtures'

const snapshot: MapSessionSnapshot = {
  conditions: {
    keyword: '스시',
    category: 'restaurant',
    sort: 'rating',
    areaCode: null,
  },
  camera: {
    center: { lat: 35.6, lng: 139.7 },
    zoom: 14,
    bounds: { south: 35.5, north: 35.7, west: 139.6, east: 139.8 },
  },
  searchBounds: { south: 35.5, north: 35.7, west: 139.6, east: 139.8 },
  selectedId: '10',
  isExploring: true,
  stage: 'normal',
  detailStage: 'expanded',
  detailTab: 'menu',
  detailScrollTop: 180,
  detailReviewSort: 'rating-high',
}

beforeEach(() => {
  sessionStorage.clear()
  vi.resetModules()
})

it('restores once after the app module memory was lost, without replaying an action', async () => {
  const before = await import('@/pages/map/utils/mapSession')
  before.writeMapSession(snapshot)
  before.leaveMapSession(1000)
  before.persistMapSessionForOAuth(2000)
  vi.resetModules()
  const after = await import('@/pages/map/utils/mapSession')
  expect(after.readMapSession(3000)).toBeNull()
  expect(after.restoreMapSessionAfterOAuth(3000)).toMatchObject({
    ...snapshot,
    restoreAfterOAuth: true,
  })
  expect(sessionStorage.length).toBe(0)
  expect(after.readMapSession(3000)).toMatchObject(snapshot)
  vi.resetModules()
  const reloaded = await import('@/pages/map/utils/mapSession')
  expect(reloaded.restoreMapSessionAfterOAuth(3001)).toBeNull()
})

it('does not extend the original five-minute inactivity deadline for login', async () => {
  const session = await import('@/pages/map/utils/mapSession')
  session.writeMapSession(snapshot)
  session.leaveMapSession(1000)
  session.persistMapSessionForOAuth(2000)
  vi.resetModules()
  const after = await import('@/pages/map/utils/mapSession')
  expect(after.restoreMapSessionAfterOAuth(301000)).toBeNull()
  expect(sessionStorage.length).toBe(0)
})

it('retains loaded pages so a selected restaurant on a later page can be restored', async () => {
  const session = await import('@/pages/map/utils/mapSession')
  const first = createMapPageFixture()
  const selected = first.restaurants.at(-1)!
  const pages = [
    {
      ...first,
      restaurants: first.restaurants.slice(0, 1),
      hasNext: true,
      nextCursor: 'next',
    },
    { ...first, restaurants: [selected] },
  ]
  session.writeMapSession({
    ...snapshot,
    selectedId: selected.id,
    queryData: { pages, pageParams: [null, { cursor: 'next' }] },
  })
  session.persistMapSessionForOAuth(2000)
  vi.resetModules()
  const after = await import('@/pages/map/utils/mapSession')
  const restored = after.restoreMapSessionAfterOAuth(3000)
  expect(restored?.queryData?.pages[1].restaurants[0].id).toBe(selected.id)
  expect(restored?.selectedId).toBe(selected.id)
})

it('ignores malformed resume data and unavailable browser storage', async () => {
  const session = await import('@/pages/map/utils/mapSession')
  session.writeMapSession(snapshot)
  session.persistMapSessionForOAuth(2000)
  const key = sessionStorage.key(0)!
  sessionStorage.setItem(
    key,
    JSON.stringify({
      version: 1,
      leftAt: 2000,
      snapshot: { ...snapshot, conditions: null },
    }),
  )
  vi.resetModules()
  const after = await import('@/pages/map/utils/mapSession')
  expect(after.restoreMapSessionAfterOAuth(3000)).toBeNull()
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  after.writeMapSession(snapshot)
  expect(() => after.persistMapSessionForOAuth(3000)).not.toThrow()
  spy.mockRestore()
})
