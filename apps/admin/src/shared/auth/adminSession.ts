const ADMIN_SESSION_STORAGE_KEY = 'hashi.admin.session.v1'
const sessionListeners = new Set<() => void>()

export interface AdminSession {
  accessToken: string
  loginId: string
  issuedAt: string
}

const checkIsAdminSession = (value: unknown): value is AdminSession => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const session = value as Partial<AdminSession>

  return (
    typeof session.accessToken === 'string' &&
    typeof session.loginId === 'string' &&
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
  sessionListeners.forEach((listener) => listener())
}

export const clearAdminSession = () => {
  window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY)
  sessionListeners.forEach((listener) => listener())
}

export const getAdminAccessToken = () => getAdminSession()?.accessToken ?? null

export const getAdminSessionSnapshot = () =>
  window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY)

export const subscribeAdminSession = (listener: () => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === ADMIN_SESSION_STORAGE_KEY) {
      listener()
    }
  }

  sessionListeners.add(listener)
  window.addEventListener('storage', handleStorage)

  return () => {
    sessionListeners.delete(listener)
    window.removeEventListener('storage', handleStorage)
  }
}
