export type SuccessResponse<TData = unknown> = {
  success: true
  code: string
  message: string
  data?: TData
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
  timestamp: string
  path: string
  errors?: FieldError[]
}

export type ApiResponse<TData = unknown> =
  | SuccessResponse<TData>
  | ErrorResponse
