export type AuthSessionStatus =
  | 'authenticated'
  | 'onboarding'
  | 'unauthenticated'

let currentAccessToken: string | undefined
let authSessionVersion = 0
let currentAuthSessionStatus: AuthSessionStatus = 'unauthenticated'
const authSessionListeners = new Set<() => void>()

const notifyAuthSessionListeners = () => {
  authSessionListeners.forEach((listener) => {
    listener()
  })
}

export const setAccessToken = (accessToken: string) => {
  currentAccessToken = accessToken
  currentAuthSessionStatus = 'authenticated'
  notifyAuthSessionListeners()
}

export const startAuthenticatedSession = (accessToken: string) => {
  authSessionVersion += 1
  setAccessToken(accessToken)
}

export const setOnboardingSession = () => {
  authSessionVersion += 1
  currentAccessToken = undefined
  currentAuthSessionStatus = 'onboarding'
  notifyAuthSessionListeners()
}

export const getAccessToken = () => {
  return currentAccessToken
}

export const getAuthSessionStatus = () => {
  return currentAuthSessionStatus
}

export const clearAuthSession = () => {
  authSessionVersion += 1
  currentAccessToken = undefined
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
