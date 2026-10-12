import { useMutation, useQueryClient } from '@tanstack/react-query'

import { requestLogout } from '@/features/auth/api/logout'
import {
  clearAuthSession,
  getAuthSessionVersion,
} from '@/shared/auth/authSession'

export const useLogoutMutation = (onLoggedOut: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: requestLogout,
    onMutate: () => getAuthSessionVersion(),
    onSuccess: (_data, _variables, sessionVersion) => {
      if (getAuthSessionVersion() !== sessionVersion) return
      queryClient.clear()
      clearAuthSession()
      onLoggedOut()
    },
  })
}
