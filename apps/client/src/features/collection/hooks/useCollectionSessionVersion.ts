import { useSyncExternalStore } from 'react'

import {
  getAuthSessionVersion,
  subscribeAuthSession,
} from '@/shared/auth/authSession'

export const useCollectionSessionVersion = () =>
  useSyncExternalStore(
    subscribeAuthSession,
    getAuthSessionVersion,
    getAuthSessionVersion,
  )
