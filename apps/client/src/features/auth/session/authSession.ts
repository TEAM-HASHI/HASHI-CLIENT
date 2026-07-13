export type AuthSessionStatus =
  | 'authenticated'
  | 'onboarding'
  | 'unauthenticated'

let currentAccessToken: string | undefined
let currentAuthSessionStatus: AuthSessionStatus = 'unauthenticated'

export const setAccessToken = (accessToken: string) => {
  currentAccessToken = accessToken
  currentAuthSessionStatus = 'authenticated'
}

export const setOnboardingSession = () => {
  currentAccessToken = undefined
  currentAuthSessionStatus = 'onboarding'
}

export const getAccessToken = () => {
  return currentAccessToken
}

export const getAuthSessionStatus = () => {
  return currentAuthSessionStatus
}

export const clearAuthSession = () => {
  currentAccessToken = undefined
  currentAuthSessionStatus = 'unauthenticated'
}
