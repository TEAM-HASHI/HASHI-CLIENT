import { useSyncExternalStore } from 'react'
import {
  getAdminSession,
  getAdminSessionSnapshot,
  subscribeAdminSession,
} from '@/shared/auth/adminSession'

export const useAdminSession = () => {
  useSyncExternalStore(
    subscribeAdminSession,
    getAdminSessionSnapshot,
    () => null,
  )

  return getAdminSession()
}
