import type { Options } from 'ky'
import { apiClient } from '@/shared/api/apiClient'
import { parseAdminApiResponse } from '@/shared/api/apiResponse'
import {
  checkIsSameAdminSession,
  clearAdminSession,
  getAdminSession,
} from '@/shared/auth/adminSession'
import { reissueAdminSession } from '@/shared/auth/reissueAdminSession'

export { AdminApiRequestError } from '@/shared/api/apiResponse'

const normalizePath = (path: string) => path.replace(/^\/+/, '')
const checkIsAuthPath = (path: string) => path.startsWith('api/v1/auth/')

export const request = async <TData>(
  path: string,
  options?: Options,
): Promise<TData> => {
  const normalizedPath = normalizePath(path)
  let sessionToClear = getAdminSession()
  let response = await apiClient(normalizedPath, options)

  if (
    response.status === 401 &&
    sessionToClear &&
    !checkIsAuthPath(normalizedPath)
  ) {
    try {
      await reissueAdminSession()
      sessionToClear = getAdminSession()
      response = await apiClient(normalizedPath, options)
    } catch (error) {
      if (checkIsSameAdminSession(getAdminSession(), sessionToClear)) {
        clearAdminSession()
      }
      throw error
    }
  }

  if (
    response.status === 401 &&
    checkIsSameAdminSession(getAdminSession(), sessionToClear)
  ) {
    clearAdminSession()
  }

  return parseAdminApiResponse<TData>(response)
}
