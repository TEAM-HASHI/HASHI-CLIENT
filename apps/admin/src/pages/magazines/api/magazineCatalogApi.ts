import { ADMIN_ENDPOINTS } from '@/shared/api/adminEndpoints'
import type { components, paths } from '@/shared/api/generated/user-openapi'
import { request } from '@/shared/api/request'

export type MagazineCatalogParams = NonNullable<
  paths['/api/v1/magazines']['get']['parameters']['query']
>
export type MagazineCatalogData = components['schemas']['MagazineListResponse']
export type MagazineCatalogItem =
  components['schemas']['MagazineSummaryResponse']

export const magazineCatalogApi = {
  list(params: MagazineCatalogParams = {}) {
    const searchParams = new URLSearchParams()

    if (params.cursor !== undefined) {
      searchParams.set('cursor', String(params.cursor))
    }
    if (params.size !== undefined) {
      searchParams.set('size', String(params.size))
    }

    return request<MagazineCatalogData>(ADMIN_ENDPOINTS.publicMagazines, {
      method: 'get',
      searchParams,
    })
  },
}
