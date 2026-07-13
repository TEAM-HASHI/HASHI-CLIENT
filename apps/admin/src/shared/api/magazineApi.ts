import { ADMIN_ENDPOINTS } from '@/shared/api/adminEndpoints'
import type { components, paths } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

export type CreateMagazineBody =
  paths['/api/v1/admin/magazines']['post']['requestBody']['content']['application/json']
export type UpdateMagazineBody =
  paths['/api/v1/admin/magazines/{magazineId}']['patch']['requestBody']['content']['application/json']
export type AdminMagazineData = components['schemas']['AdminMagazineResponse']

type MagazineId =
  paths['/api/v1/admin/magazines/{magazineId}']['patch']['parameters']['path']['magazineId']

export const magazineApi = {
  createMagazine(input: CreateMagazineBody) {
    return request<AdminMagazineData>(ADMIN_ENDPOINTS.magazines, {
      method: 'post',
      json: input,
    })
  },
  updateMagazine(magazineId: MagazineId, input: UpdateMagazineBody) {
    return request<AdminMagazineData>(ADMIN_ENDPOINTS.magazine(magazineId), {
      method: 'patch',
      json: input,
    })
  },
  deleteMagazine(magazineId: MagazineId) {
    return request<unknown>(ADMIN_ENDPOINTS.magazine(magazineId), {
      method: 'delete',
    })
  },
}
