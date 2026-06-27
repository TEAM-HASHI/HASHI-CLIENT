import type { ErrorResponse } from './types'

export class ApiError extends Error {
  readonly body: ErrorResponse
  readonly code: string
  readonly status?: number

  constructor(body: ErrorResponse, status?: number) {
    super(body.message)
    this.name = 'ApiError'
    this.body = body
    this.code = body.code
    this.status = status
  }
}

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError
}
