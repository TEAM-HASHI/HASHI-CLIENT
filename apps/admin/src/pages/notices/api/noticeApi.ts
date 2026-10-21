import type { components, paths } from '@/shared/api/generated/notice-openapi'
import { request } from '@/shared/api/request'

export type AdminNotice = components['schemas']['AdminNoticeResponse']
export type NoticeList = components['schemas']['AdminNoticeListResponse']
export type SaveNotice =
  paths['/api/v1/admin/notices']['post']['requestBody']['content']['application/json']

const endpoint = '/api/v1/admin/notices'

export const noticeApi = {
  list: (page: number, signal?: AbortSignal) =>
    request<NoticeList>(endpoint, { searchParams: { page, size: 20 }, signal }),
  detail: (id: number, signal?: AbortSignal) =>
    request<AdminNotice>(`${endpoint}/${id}`, { signal }),
  save: (id: number | null, body: SaveNotice) =>
    request<AdminNotice>(id === null ? endpoint : `${endpoint}/${id}`, {
      method: id === null ? 'post' : 'put',
      json: body,
    }),
  publish: (id: number) =>
    request<AdminNotice>(`${endpoint}/${id}/publication`, { method: 'post' }),
  delete: (id: number) =>
    request<null>(`${endpoint}/${id}`, { method: 'delete' }),
}
