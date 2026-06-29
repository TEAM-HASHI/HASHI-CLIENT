export type SuccessResponse<TData = unknown> = {
  success: true
  code: string
  message: string
  data: TData | null
}

export type FieldError = {
  field: string
  rejectedValue: unknown
  reason: string
}

export type ErrorResponse = {
  success: false
  code: string
  message: string
  data: null
  timestamp: string
  path: string
  errors?: FieldError[]
}

export type ApiResponse<TData = unknown> =
  | SuccessResponse<TData>
  | ErrorResponse

export const isErrorResponse = (
  response: ApiResponse<unknown>,
): response is ErrorResponse => !response.success
