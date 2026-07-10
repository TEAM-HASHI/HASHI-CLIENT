import type { ErrorResponse } from '@/shared/api/types'

export class ApiError extends Error {
  readonly response: ErrorResponse
  readonly status: number

  constructor(response: ErrorResponse, status: number) {
    super(response.message)
    this.name = 'ApiError'
    this.response = response
    this.status = status
  }

  get code() {
    return this.response.code
  }

  get fieldErrors() {
    return this.response.errors ?? []
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError

export const checkIsRetryableApiError = (error: unknown) =>
  isApiError(error) && error.status >= 500

export const checkIsAuthRequiredError = (error: unknown) =>
  isApiError(error) && error.status === 401

export const checkIsNotFoundError = (error: unknown) =>
  isApiError(error) && error.status === 404
