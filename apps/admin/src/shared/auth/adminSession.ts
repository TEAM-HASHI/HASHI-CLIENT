const ADMIN_SESSION_STORAGE_KEY = 'hashi.admin.session.v1'

export interface AdminSession {
  token: string
  email: string
  name: string
  issuedAt: string
}

const checkIsAdminSession = (value: unknown): value is AdminSession => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const session = value as Partial<AdminSession>

  return (
    typeof session.token === 'string' &&
    typeof session.email === 'string' &&
    typeof session.name === 'string' &&
    typeof session.issuedAt === 'string'
  )
}

export const getAdminSession = () => {
  const rawSession = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    const parsedSession: unknown = JSON.parse(rawSession)

    if (!checkIsAdminSession(parsedSession)) {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
      return null
    }

    return parsedSession
  } catch {
    window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
    return null
  }
}

export const setAdminSession = (session: AdminSession) => {
  window.localStorage.setItem(
    ADMIN_SESSION_STORAGE_KEY,
    JSON.stringify(session),
  )
}

export const clearAdminSession = () => {
  window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
}

export const getAdminAccessToken = () => getAdminSession()?.token ?? null
