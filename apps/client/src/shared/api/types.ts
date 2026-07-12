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

const checkIsRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const checkIsFieldError = (value: unknown): value is FieldError =>
  checkIsRecord(value) &&
  typeof value.field === 'string' &&
  typeof value.reason === 'string' &&
  'rejectedValue' in value

export const isSuccessResponse = <TData>(
  response: unknown,
): response is SuccessResponse<TData> =>
  checkIsRecord(response) &&
  response.success === true &&
  typeof response.code === 'string' &&
  typeof response.message === 'string' &&
  'data' in response &&
  response.data !== undefined

export const isErrorResponse = (response: unknown): response is ErrorResponse =>
  checkIsRecord(response) &&
  response.success === false &&
  typeof response.code === 'string' &&
  typeof response.message === 'string' &&
  response.data === null &&
  typeof response.timestamp === 'string' &&
  typeof response.path === 'string' &&
  (response.errors === undefined ||
    (Array.isArray(response.errors) &&
      response.errors.every(checkIsFieldError)))
