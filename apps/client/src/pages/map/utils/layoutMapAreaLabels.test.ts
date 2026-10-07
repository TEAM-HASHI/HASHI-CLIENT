import { expect, it } from 'vitest'
import { layoutMapAreaLabels } from '@/pages/map/utils/layoutMapAreaLabels'

it('separates nearby labels without changing their geographic positions', () => {
  const areas = [
    { code: 'ueno', position: { lat: 35.7142, lng: 139.7774 } },
    { code: 'asakusa', position: { lat: 35.7148, lng: 139.7967 } },
  ]
  const offsets = layoutMapAreaLabels(areas, 11)
  expect(offsets.ueno).toBe(0)
  expect(offsets.asakusa).toBeGreaterThanOrEqual(52)
  expect(layoutMapAreaLabels(areas, 15)).toEqual({ ueno: 0, asakusa: 0 })
})
