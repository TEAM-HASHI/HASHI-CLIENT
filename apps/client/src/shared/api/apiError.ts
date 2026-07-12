import type { ErrorResponse, FieldError } from '@/shared/api/types'

export class ApiError extends Error {
  readonly response: ErrorResponse
  readonly status: number

  constructor(response: ErrorResponse, status: number, options?: ErrorOptions) {
    super(response.message, options)
    this.name = 'ApiError'
    this.response = response
    this.status = status
  }

  get code(): string {
    return this.response.code
  }

  get fieldErrors(): FieldError[] {
    return this.response.errors ?? []
  }
}

export class HttpStatusError extends Error {
  readonly status: number

  constructor(status: number, options?: ErrorOptions) {
    super(`HTTP ${status}`, options)
    this.name = 'HttpStatusError'
    this.status = status
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError

export const isHttpStatusError = (error: unknown): error is HttpStatusError =>
  error instanceof HttpStatusError

export const checkHasHttpStatus = (
  error: unknown,
): error is ApiError | HttpStatusError =>
  isApiError(error) || isHttpStatusError(error)

export const checkIsRetryableStatusError = (error: unknown) =>
  checkHasHttpStatus(error) && error.status >= 500

export const checkIsAuthRequiredError = (error: unknown) =>
  checkHasHttpStatus(error) && error.status === 401

export const checkIsNotFoundError = (error: unknown) =>
  checkHasHttpStatus(error) && error.status === 404
