import { ADMIN_ENDPOINTS } from '@/shared/api/adminEndpoints'
import { request } from '@/shared/api/request'
import type {
  AdminResourceId,
  CreateMagazineRequest,
  CreateMagazineResponseData,
  UpdateMagazineRequest,
  UpdateMagazineResponseData,
} from '@/shared/api/adminTypes'

export const magazineApi = {
  createMagazine(input: CreateMagazineRequest) {
    return request<CreateMagazineResponseData>(ADMIN_ENDPOINTS.magazines, {
      method: 'post',
      json: input,
    })
  },
  updateMagazine(magazineId: AdminResourceId, input: UpdateMagazineRequest) {
    return request<UpdateMagazineResponseData>(
      ADMIN_ENDPOINTS.magazine(magazineId),
      {
        method: 'patch',
        json: input,
      },
    )
  },
}
