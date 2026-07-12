import { request } from '@/shared/api'
import type { components, paths } from '@/shared/api/generated/openapi'

export type MagazineListData = components['schemas']['MagazineListResponse']

export type GetMagazinesQuery = NonNullable<
  paths['/api/v1/magazines']['get']['parameters']['query']
>

export const getMagazines = async (params: GetMagazinesQuery) => {
  const data = await request<MagazineListData>('/api/v1/magazines', {
    searchParams: params,
  })

  return data ?? { hasNext: false, magazines: [] }
}
