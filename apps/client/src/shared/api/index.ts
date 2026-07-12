export {
  ApiError,
  HttpStatusError,
  checkHasHttpStatus,
  checkIsAuthRequiredError,
  checkIsNotFoundError,
  checkIsRetryableStatusError,
  isApiError,
  isHttpStatusError,
} from './apiError'
export {
  ERROR_CATALOG,
  checkIsKnownApiErrorCode,
  getCommonErrorCatalogEntryByStatus,
  getErrorCatalogEntry,
  type ErrorCatalogEntry,
  type KnownApiErrorCode,
} from './errorCatalog'
export {
  DEFAULT_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  TIMEOUT_ERROR_MESSAGE,
  getErrorPresentation,
  type ErrorPresentation,
} from './errorPresentation'
export { apiClient } from './apiClient'
export { request } from './request'
export {
  isErrorResponse,
  type ApiResponse,
  type ErrorResponse,
  type FieldError,
  type SuccessResponse,
} from './types'
