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

export const parseAdminApiResponse = async <TData>(response: Response) => {
  const responseBody = (await response.json()) as AdminApiResponse<TData>

  if (!response.ok || !responseBody.success) {
    throw new AdminApiRequestError(
      response.status,
      responseBody.success ? null : responseBody,
    )
  }

  return responseBody.data
}
