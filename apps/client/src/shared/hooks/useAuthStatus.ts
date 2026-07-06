export type AuthStatus = 'authenticated' | 'unauthenticated'

export const useAuthStatus = (): {
  isAuthenticated: boolean
  status: AuthStatus
} => {
  return {
    isAuthenticated: true,
    status: 'authenticated',
  }
}
