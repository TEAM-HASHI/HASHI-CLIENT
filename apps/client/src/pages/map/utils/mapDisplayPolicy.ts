type MapDisplayMode = 'areas' | 'restaurants'

export const getMapDisplayMode = ({
  zoom,
  previous,
  hasConditions,
  overviewZoom = 11,
}: {
  zoom: number
  previous: MapDisplayMode
  hasConditions: boolean
  overviewZoom?: number
}): MapDisplayMode => {
  if (hasConditions || zoom >= overviewZoom + 1) return 'restaurants'
  if (zoom <= overviewZoom + 0.01) return 'areas'
  return previous
}
