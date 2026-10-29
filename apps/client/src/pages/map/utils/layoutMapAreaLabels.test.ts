import { expect, it } from 'vitest'
import { layoutMapAreaLabels } from '@/pages/map/utils/layoutMapAreaLabels'

it('separates nearby labels without changing their geographic positions', () => {
  const areas = [
    { code: 'ueno', position: { lat: 35.7142, lng: 139.7774 } },
    { code: 'asakusa', position: { lat: 35.7148, lng: 139.7967 } },
  ]
  const offsets = layoutMapAreaLabels(areas, 11)
  expect(offsets.ueno).toEqual({ x: 0, y: 0 })
  expect(Math.hypot(offsets.asakusa.x, offsets.asakusa.y)).toBeGreaterThan(0)
  expect(layoutMapAreaLabels(areas, 15)).toEqual({
    ueno: { x: 0, y: 0 },
    asakusa: { x: 0, y: 0 },
  })
})

it.each([360, 375, 390, 414, 430])(
  'keeps nine crowded regions inside a %ipx-wide short map instead of cascading below it',
  (width) => {
    const areas = Array.from({ length: 9 }, (_, index) => ({
      code: String(index),
      position: { lat: 0, lng: 0 },
    }))
    const offsets = Object.values(
      layoutMapAreaLabels(areas, 9.36, {
        center: { lat: 0, lng: 0 },
        width,
        height: 303,
      }),
    )
    expect(offsets).toHaveLength(9)
    offsets.forEach(({ x, y }, index) => {
      // Reserve the search/chip area, sheet overlap and bookmark FAB.
      expect(width / 2 + x - 48).toBeGreaterThanOrEqual(0)
      expect(width / 2 + x + 48).toBeLessThanOrEqual(width)
      expect(151.5 + y - 22).toBeGreaterThanOrEqual(118)
      expect(151.5 + y + 22).toBeLessThanOrEqual(275)
      // The bookmark FAB occupies x=20..64 and y=219..263.
      expect(width / 2 + x - 48 >= 72 || 151.5 + y + 22 <= 211).toBe(true)
      offsets.slice(0, index).forEach((other) => {
        expect(Math.abs(x - other.x) >= 96 || Math.abs(y - other.y) >= 44).toBe(
          true,
        )
      })
    })
  },
)

it('does not pull offscreen geographic anchors back into view after panning', () => {
  expect(
    layoutMapAreaLabels(
      [{ code: 'outside', position: { lat: 35, lng: 139 } }],
      12,
      { center: { lat: 0, lng: 0 }, width: 430, height: 303 },
    ),
  ).toEqual({ outside: { x: 0, y: 0 } })
})
