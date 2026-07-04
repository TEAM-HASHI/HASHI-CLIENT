import type { ErrorResponse } from '@/shared/api/types'

export class ApiError extends Error {
  readonly response: ErrorResponse

  constructor(response: ErrorResponse) {
    super(response.message)
    this.name = 'ApiError'
    this.response = response
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
