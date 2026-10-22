import { useMutation, useQueryClient } from '@tanstack/react-query'

import { requestLogout } from '@/features/auth/api/logout'
import {
  clearAuthSession,
  getAuthSessionStatus,
  getAuthSessionVersion,
} from '@/shared/auth/authSession'

export const useLogoutMutation = (onLoggedOut: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: requestLogout,
    onMutate: () => getAuthSessionVersion(),
    onSuccess: (_data, _variables, sessionVersion) => {
      if (
        getAuthSessionVersion() !== sessionVersion &&
        getAuthSessionStatus() !== 'unauthenticated'
      ) {
        return
      }
      queryClient.clear()
      clearAuthSession()
      onLoggedOut()
    },
  })
}
