import { createContext, useContext } from 'react'

interface AuthSessionRestoreContextValue {
  isRestoring: boolean
}

export const AuthSessionRestoreContext =
  createContext<AuthSessionRestoreContextValue>({ isRestoring: false })

export const useAuthSessionRestoreStatus = () => {
  return useContext(AuthSessionRestoreContext)
}
