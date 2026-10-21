export type AuthSessionStatus =
  | 'authenticated'
  | 'onboarding'
  | 'unauthenticated'

let currentAccessToken: string | undefined
let currentSubjectId: number | undefined
let authSessionVersion = 0
let currentAuthSessionStatus: AuthSessionStatus = 'unauthenticated'
const authSessionListeners = new Set<() => void>()

const notifyAuthSessionListeners = () => {
  authSessionListeners.forEach((listener) => {
    listener()
  })
}

export const setAccessToken = (
  accessToken: string,
  subjectId = currentSubjectId,
) => {
  currentAccessToken = accessToken
  currentSubjectId = subjectId
  currentAuthSessionStatus = 'authenticated'
  notifyAuthSessionListeners()
}

export const startAuthenticatedSession = (
  accessToken: string,
  subjectId?: number,
) => {
  authSessionVersion += 1
  currentSubjectId = subjectId
  setAccessToken(accessToken)
}

export const setOnboardingSession = () => {
  authSessionVersion += 1
  currentAccessToken = undefined
  currentSubjectId = undefined
  currentAuthSessionStatus = 'onboarding'
  notifyAuthSessionListeners()
}

export const getAccessToken = () => {
  return currentAccessToken
}

export const getAuthSessionStatus = () => {
  return currentAuthSessionStatus
}

export const getAuthSubjectId = () => currentSubjectId

export const clearAuthSession = () => {
  authSessionVersion += 1
  currentAccessToken = undefined
  currentSubjectId = undefined
  currentAuthSessionStatus = 'unauthenticated'
  notifyAuthSessionListeners()
}

export const getAuthSessionVersion = () => authSessionVersion

export const subscribeAuthSession = (listener: () => void) => {
  authSessionListeners.add(listener)

  return () => {
    authSessionListeners.delete(listener)
  }
}
