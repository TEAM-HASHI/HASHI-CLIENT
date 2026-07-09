import type { Options } from 'ky'
import { apiClient } from '@/shared/api/apiClient'
import type {
  AdminApiErrorResponse,
  AdminApiResponse,
} from '@/shared/api/adminTypes'

const normalizePath = (path: string) => path.replace(/^\/+/, '')

export class AdminApiRequestError extends Error {
  status: number
  responseBody: AdminApiErrorResponse | null

  constructor(status: number, responseBody: AdminApiErrorResponse | null) {
    super(responseBody?.message ?? `HTTP ${status}`)
    this.name = 'AdminApiRequestError'
    this.status = status
    this.responseBody = responseBody
  }
}

export const request = async <TData>(
  path: string,
  options?: Options,
): Promise<TData> => {
  const response = await apiClient(normalizePath(path), options)
  const responseBody = await response.json<AdminApiResponse<TData>>()

  if (!response.ok || !responseBody.success) {
    throw new AdminApiRequestError(
      response.status,
      responseBody.success ? null : responseBody,
    )
  }

  return responseBody.data
}
