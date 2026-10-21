import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

export type MapRegion = Required<
  components['schemas']['AdminMapRegionResponse']
>
export type SaveRegion = components['schemas']['UpsertMapRegionRequest']
export type RegionPage = Omit<
  Required<components['schemas']['Page']>,
  'content'
> & { content: MapRegion[] }
// The server explicitly accepts/returns null, which is missing from the generated schema.
export interface RegionAssignment {
  restaurantId: number
  mapRegionId: number | null
}

const endpoint = '/api/v1/admin/map-regions'
const isRegion = (region: MapRegion) =>
  region &&
  Number.isSafeInteger(region.mapRegionId) &&
  region.mapRegionId > 0 &&
  typeof region.code === 'string' &&
  typeof region.name === 'string' &&
  typeof region.active === 'boolean' &&
  Number.isInteger(region.displayOrder) &&
  region.displayOrder >= 0 &&
  [
    region.clusterPosition?.latitude,
    region.clusterPosition?.longitude,
    region.cameraBounds?.south,
    region.cameraBounds?.north,
    region.cameraBounds?.west,
    region.cameraBounds?.east,
  ].every(Number.isFinite)

export const mapRegionApi = {
  async list(page: number, signal?: AbortSignal) {
    const result = await request<RegionPage>(endpoint, {
      searchParams: { page, size: 20 },
      signal,
      cache: 'no-store',
    })
    if (
      !result ||
      !Array.isArray(result.content) ||
      !result.content.every(isRegion) ||
      result.page !== page ||
      !Number.isSafeInteger(result.totalPages) ||
      result.totalPages < 0 ||
      !Number.isSafeInteger(result.totalCount) ||
      result.totalCount < 0
    )
      throw new Error('관광 지역 목록 응답을 확인할 수 없습니다.')
    return result
  },
  async save(code: string, body: SaveRegion) {
    const result = await request<MapRegion>(
      `${endpoint}/${encodeURIComponent(code)}`,
      { method: 'put', json: body },
    )
    if (!isRegion(result) || result.code !== code)
      throw new Error(
        '관광 지역 저장 응답을 확인할 수 없습니다. 목록을 새로고침해주세요.',
      )
    return result
  },
  async assign(
    restaurantId: number,
    mapRegionId: number | null,
    signal?: AbortSignal,
  ) {
    const result = await request<RegionAssignment>(
      `/api/v1/admin/restaurants/${restaurantId}/map-region`,
      {
        method: 'put',
        json: { mapRegionId },
        signal,
      },
    )
    if (
      !result ||
      result.restaurantId !== restaurantId ||
      result.mapRegionId !== mapRegionId
    )
      throw new Error(
        '식당 배정 응답을 확인할 수 없습니다. 처리 결과를 확인해주세요.',
      )
    return result
  },
}
