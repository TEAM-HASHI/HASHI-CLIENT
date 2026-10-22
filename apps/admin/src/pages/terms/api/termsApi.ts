import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

export type AdminTerms = components['schemas']['AdminTermsResponse']
export type TermsTypeInfo = components['schemas']['AdminTermsTypeResponse']
export type SaveTerms = components['schemas']['SaveTermsRequest']
export type TermsType = SaveTerms['type']

const endpoint = '/api/v1/admin/terms'

export const termsApi = {
  types: (signal?: AbortSignal) =>
    request<TermsTypeInfo[]>(`${endpoint}/types`, { signal }),
  history: (type: TermsType, page: number, signal?: AbortSignal) =>
    request<components['schemas']['AdminTermsListResponse']>(endpoint, {
      searchParams: { type, page, size: 20 },
      signal,
    }),
  detail: (id: number, signal?: AbortSignal) =>
    request<AdminTerms>(`${endpoint}/${id}`, { signal }),
  save: (id: number | null, body: SaveTerms) =>
    request<AdminTerms>(id === null ? endpoint : `${endpoint}/${id}`, {
      method: id === null ? 'post' : 'put',
      json: body,
    }),
  publish: (id: number) =>
    request<AdminTerms>(`${endpoint}/${id}/publication`, { method: 'post' }),
  delete: (id: number) =>
    request<null>(`${endpoint}/${id}`, { method: 'delete' }),
}
