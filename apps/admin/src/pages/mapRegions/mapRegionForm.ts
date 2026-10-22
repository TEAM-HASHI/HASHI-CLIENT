import type {
  MapRegion,
  SaveRegion,
} from '@/features/mapRegion/api/mapRegionApi'

export const createRegionForm = (region?: MapRegion) => ({
  code: region?.code ?? '',
  name: region?.name ?? '',
  latitude: region ? String(region.clusterPosition.latitude) : '',
  longitude: region ? String(region.clusterPosition.longitude) : '',
  south: region ? String(region.cameraBounds.south) : '',
  north: region ? String(region.cameraBounds.north) : '',
  west: region ? String(region.cameraBounds.west) : '',
  east: region ? String(region.cameraBounds.east) : '',
  displayOrder: String(region?.displayOrder ?? 0),
  active: region?.active ?? false,
})
export type RegionForm = ReturnType<typeof createRegionForm>

const coordinate = (value: string, maximum: number) => {
  const text = value.trim()
  if (!/^[+-]?\d+(\.\d+)?$/.test(text))
    throw new Error('좌표를 숫자로 입력해주세요.')
  if ((text.split('.')[1] ?? '').replace(/0+$/, '').length > 6)
    throw new Error('좌표는 반올림 없이 소수점 6자리까지 입력해주세요.')
  const number = Number(text)
  if (!Number.isFinite(number) || Math.abs(number) > maximum)
    throw new Error('좌표가 허용 범위를 벗어났습니다.')
  return number
}
export const toRegionBody = (form: RegionForm): SaveRegion => {
  if (!/^[A-Z][A-Z0-9_]{0,39}$/.test(form.code.trim()))
    throw new Error(
      '코드는 대문자 영문으로 시작하는 영문 대문자·숫자·밑줄 1~40자여야 합니다.',
    )
  if (!form.name.trim() || form.name.length > 100)
    throw new Error('지역명은 1~100자로 입력해주세요.')
  if (
    !/^\d+$/.test(form.displayOrder.trim()) ||
    Number(form.displayOrder) > 2147483647
  )
    throw new Error('표시 순서는 0~2147483647의 정수로 입력해주세요.')
  const latitude = coordinate(form.latitude, 90),
    longitude = coordinate(form.longitude, 180)
  const south = coordinate(form.south, 90),
    north = coordinate(form.north, 90)
  const west = coordinate(form.west, 180),
    east = coordinate(form.east, 180)
  if (south >= north || west >= east)
    throw new Error('경계는 남쪽 < 북쪽, 서쪽 < 동쪽이어야 합니다.')
  if (
    latitude < south ||
    latitude > north ||
    longitude < west ||
    longitude > east
  )
    throw new Error('대표 좌표는 지도 경계 안에 있어야 합니다.')
  if (
    form.active &&
    (Math.round(north * 1e6) - Math.round(south * 1e6) > 1e6 ||
      Math.round(east * 1e6) - Math.round(west * 1e6) > 1e6)
  )
    throw new Error('공개 지역의 위도·경도 폭은 각각 1도 이하여야 합니다.')
  return {
    name: form.name,
    clusterPosition: { latitude, longitude },
    cameraBounds: { south, north, west, east },
    displayOrder: Number(form.displayOrder),
    active: form.active,
  }
}
