import type { MapArea, MapPosition } from '@/pages/map/types'

export interface MapLabelViewport {
  center: MapPosition
  width: number
  height: number
}

interface LabelOffset {
  x: number
  y: number
}

const project = ({ lat, lng }: MapPosition, scale: number) => {
  const sin = Math.sin((lat * Math.PI) / 180)
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  }
}

// Keep 96×44px targets near their anchors, with 8px between targets.
// A bounded two-dimensional search avoids an unbounded downward cascade.
export const layoutMapAreaLabels = (
  areas: readonly Pick<MapArea, 'code' | 'position'>[],
  zoom: number,
  viewport?: MapLabelViewport | null,
): Record<string, LabelOffset> => {
  const scale = 256 * 2 ** zoom
  const center = viewport ? project(viewport.center, scale) : { x: 0, y: 0 }
  const placed: LabelOffset[] = []
  return Object.fromEntries(
    areas.map(({ code, position }) => {
      const point = project(position, scale)
      const anchor = {
        x: point.x - center.x + (viewport?.width ?? 0) / 2,
        y: point.y - center.y + (viewport?.height ?? 0) / 2,
      }
      if (
        viewport &&
        (anchor.x < 0 ||
          anchor.x > viewport.width ||
          anchor.y < 0 ||
          anchor.y > viewport.height)
      )
        return [code, { x: 0, y: 0 }]
      const insetX = viewport
        ? Math.min(viewport.width < 376 ? 48 : 56, viewport.width / 2)
        : 0
      // The sheet overlaps the map's last 20px; keep a further 8px gap.
      const maxY = viewport ? Math.max(22, viewport.height - 50) : Infinity
      const minY = Math.min(140, maxY)
      const columns = viewport
        ? Math.max(1, Math.floor((viewport.width - 2 * insetX) / 104) + 1)
        : 1
      const columnStep =
        viewport && columns === 3
          ? Math.max(96, Math.min(104, (viewport.width - insetX - 120) / 2))
          : 104
      const nearby = [-2, -1, 0, 1, 2].flatMap((column) =>
        [-3, -2, -1, 0, 1, 2, 3].map((row) => {
          const x = anchor.x + column * 104.02
          const y = anchor.y + row * 52.02
          return {
            x: viewport
              ? Math.max(insetX, Math.min(viewport.width - insetX, x))
              : x,
            y: viewport ? Math.max(minY, Math.min(maxY, y)) : y,
          }
        }),
      )
      // A short viewport needs shared slots: independently shifted rows can
      // otherwise fragment the little remaining space between overlays.
      const candidates =
        viewport && viewport.height < 400
          ? Array.from(
              {
                length: columns,
              },
              (_, column) =>
                Array.from(
                  { length: Math.floor((maxY - minY) / 52.02) + 1 },
                  (_, row) => ({
                    x:
                      viewport.width -
                      insetX -
                      (columns - 1 - column) * columnStep,
                    y: minY + row * 52.02,
                  }),
                ),
            ).flat()
          : nearby
      const overlap = (candidate: LabelOffset) =>
        placed.reduce(
          (sum, other) =>
            sum +
            Math.max(0, 104 - Math.abs(other.x - candidate.x)) *
              Math.max(0, 52 - Math.abs(other.y - candidate.y)),
          viewport
            ? Math.max(0, 78 - Math.abs(candidate.x - 42)) *
                Math.max(0, 52 - Math.abs(candidate.y - (viewport.height - 62)))
            : 0,
        )
      candidates.sort(
        (a, b) =>
          overlap(a) - overlap(b) ||
          Math.hypot(a.x - anchor.x, a.y - anchor.y) -
            Math.hypot(b.x - anchor.x, b.y - anchor.y),
      )
      const target = candidates[0]
      placed.push(target)
      return [code, { x: target.x - anchor.x, y: target.y - anchor.y }]
    }),
  )
}
