import type { ErrorResponse, FieldError } from '@/shared/api/types'

export interface ApiErrorOptions {
  status: number
  response?: ErrorResponse
  cause?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly response?: ErrorResponse

  constructor({ status, response, cause }: ApiErrorOptions) {
    super(response?.message ?? `HTTP ${status}`, { cause })
    this.name = 'ApiError'
    this.status = status
    this.response = response
  }

  get code(): string | undefined {
    return this.response?.code
  }

  get fieldErrors(): FieldError[] {
    return this.response?.errors ?? []
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError
