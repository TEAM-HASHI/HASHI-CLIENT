import { isNetworkError, isTimeoutError } from 'ky'

import { isApiError } from '@/shared/api/apiError'
import {
  getCommonErrorCatalogEntryByStatus,
  getErrorCatalogEntry,
} from '@/shared/api/errorCatalog'

export const DEFAULT_ERROR_MESSAGE =
  '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
export const NETWORK_ERROR_MESSAGE =
  '네트워크 연결을 확인한 후 다시 시도해주세요.'
export const TIMEOUT_ERROR_MESSAGE =
  '요청 시간이 초과되었습니다. 다시 시도해주세요.'

export interface ErrorPresentation {
  code?: string
  message: string
}

export const getErrorPresentation = (error: unknown): ErrorPresentation => {
  if (isApiError(error)) {
    const codeEntry = error.code ? getErrorCatalogEntry(error.code) : undefined

    if (codeEntry) {
      return { code: codeEntry.code, message: codeEntry.message }
    }

    const statusEntry = getCommonErrorCatalogEntryByStatus(error.status)

    if (statusEntry) {
      return { code: statusEntry.code, message: statusEntry.message }
    }

    return { message: DEFAULT_ERROR_MESSAGE }
  }

  if (isTimeoutError(error)) {
    return { message: TIMEOUT_ERROR_MESSAGE }
  }

  if (isNetworkError(error)) {
    return { message: NETWORK_ERROR_MESSAGE }
  }

  return { message: DEFAULT_ERROR_MESSAGE }
}
