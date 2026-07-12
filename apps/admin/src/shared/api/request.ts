import type { Options } from 'ky'
import { apiClient } from '@/shared/api/apiClient'

export interface AdminFieldError {
  field: string
  rejectedValue: unknown
  reason: string
}

export interface AdminApiSuccessResponse<TData> {
  success: true
  code: string
  message: string
  data: TData
}

export interface AdminApiErrorResponse {
  success: false
  code: string
  message: string
  data: null
  timestamp: string
  path: string
  errors?: AdminFieldError[]
}

export type AdminApiResponse<TData> =
  | AdminApiSuccessResponse<TData>
  | AdminApiErrorResponse

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
