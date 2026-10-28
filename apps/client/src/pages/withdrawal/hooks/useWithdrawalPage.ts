import { showToast } from '@hashi/hds-ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBeforeUnload, useBlocker, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { requestWithdrawal } from '@/pages/withdrawal/api/requestWithdrawal'
import { checkIsAuthRequiredError, isApiError } from '@/shared/api/apiError'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import {
  clearAuthSession,
  getAuthSessionStatus,
  getAuthSessionVersion,
  wasAuthSessionExpired,
} from '@/shared/auth/authSession'
import { captureError } from '@/shared/lib/sentry'

export const useWithdrawalPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isConfirmed, setIsConfirmed] = useState(false)
  const pendingSessionVersion = useRef<number | null>(null)

  const canHandleResponse = (version: number) =>
    getAuthSessionVersion() === version || wasAuthSessionExpired(version)

  const finishWithdrawal = (version: number) => {
    if (!canHandleResponse(version)) return
    pendingSessionVersion.current = null
    queryClient.clear()
    clearAuthSession()
    navigate(ROUTES.loginRequired, { replace: true })
  }

  const mutation = useMutation({
    mutationFn: async (version: number) => {
      if (getAuthSessionVersion() !== version) return false
      await requestWithdrawal()
      return true
    },
    retry: false,
    onSuccess: (completed, version) => {
      if (completed) finishWithdrawal(version)
    },
    onError: (error, version) => {
      if (!canHandleResponse(version)) return
      if (
        checkIsAuthRequiredError(error) ||
        (isApiError(error) && error.code === 'USER-005')
      ) {
        finishWithdrawal(version)
        return
      }
      captureError(error)
      showToast({
        children:
          isApiError(error) && error.code === 'RESERVATION-008'
            ? error.message
            : getErrorPresentation(error).message,
      })
    },
    onSettled: () => {
      pendingSessionVersion.current = null
    },
  })

  const shouldBlockNavigation = useCallback(
    () =>
      pendingSessionVersion.current !== null &&
      pendingSessionVersion.current === getAuthSessionVersion() &&
      getAuthSessionStatus() === 'authenticated',
    [],
  )
  const blocker = useBlocker(shouldBlockNavigation)
  useEffect(() => {
    if (blocker.state === 'blocked') blocker.reset()
  }, [blocker])
  useBeforeUnload(
    useCallback(
      (event) => {
        if (shouldBlockNavigation()) event.preventDefault()
      },
      [shouldBlockNavigation],
    ),
  )

  return {
    isConfirmed,
    isPending: mutation.isPending,
    setIsConfirmed,
    handleReturn: () => {
      if (pendingSessionVersion.current === null) navigate(ROUTES.mypage)
    },
    handleWithdraw: () => {
      if (!isConfirmed || pendingSessionVersion.current !== null) return
      const version = getAuthSessionVersion()
      pendingSessionVersion.current = version
      mutation.mutate(version)
    },
  }
}
