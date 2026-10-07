import type { MapArea } from '@/pages/map/types'

// Labels reserve a 96×44px hit box. Only their screen offset changes;
// the geographic anchor remains untouched and is connected by a leader.
export const layoutMapAreaLabels = (
  areas: readonly Pick<MapArea, 'code' | 'position'>[],
  zoom: number,
): Record<string, number> => {
  const placed: { x: number; y: number }[] = []
  const scale = 256 * 2 ** zoom
  return Object.fromEntries(
    areas.map(({ code, position }) => {
      const sin = Math.sin((position.lat * Math.PI) / 180)
      const x = ((position.lng + 180) / 360) * scale
      const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale
      let offset = 0
      while (
        placed.some(
          (other) =>
            Math.abs(other.x - x) < 104 && Math.abs(other.y - y - offset) < 52,
        )
      ) {
        const overlaps = placed.filter(
          (other) =>
            Math.abs(other.x - x) < 104 && Math.abs(other.y - y - offset) < 52,
        )
        offset = Math.max(...overlaps.map((other) => other.y + 52 - y)) + 0.01
      }
      placed.push({ x, y: y + offset })
      return [code, offset]
    }),
  )
}
