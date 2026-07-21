import { authApi } from '@/shared/api/authApi'
import {
  checkIsSameAdminSession,
  getAdminSession,
  setAdminSession,
} from '@/shared/auth/adminSession'

let inFlightReissue: Promise<void> | null = null

const runReissue = async () => {
  const session = getAdminSession()

  if (!session) {
    throw new Error('관리자 세션이 없습니다.')
  }

  const accessToken = await authApi.reissue()
  const currentSession = getAdminSession()

  if (!currentSession || !checkIsSameAdminSession(currentSession, session)) {
    throw new Error('관리자 세션이 변경되었습니다.')
  }

  setAdminSession({
    ...currentSession,
    accessToken,
    issuedAt: new Date().toISOString(),
  })
}

export const reissueAdminSession = () => {
  if (!inFlightReissue) {
    inFlightReissue = runReissue().finally(() => {
      inFlightReissue = null
    })
  }

  return inFlightReissue
}
