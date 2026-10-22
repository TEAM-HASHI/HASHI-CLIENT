import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { ROUTES } from '@/app/router/path'
import {
  clearAuthSession,
  getAuthSessionVersion,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'
import { requestOnboarding } from '@/pages/profileNew/api/requestOnboarding'
import type { ProfileDraft } from '@/features/profile/hooks/useProfileForm'
import { createOnboardingRequestBody } from '@/pages/profileNew/utils/profileNewForm'
import {
  applyProfileApiError,
  type ProfileApiErrorHandlers,
} from '@/features/profile/utils/profileApiError'
import { checkHasHttpStatus } from '@/shared/api/apiError'
import { getErrorPresentation } from '@/shared/api/errorPresentation'

interface UseProfileNewMutationOptions {
  getRedirectPath: () => string
  getUploadedProfileImageKey: (file: File) => Promise<string>
  navigateTo: (to: string, options?: { replace?: boolean }) => void
  setFieldError: ProfileApiErrorHandlers['setFieldError']
  setFormError: ProfileApiErrorHandlers['setFormError']
}

export const useProfileNewMutation = ({
  getRedirectPath,
  getUploadedProfileImageKey,
  navigateTo,
  setFieldError,
  setFormError,
}: UseProfileNewMutationOptions) => {
  const isMountedRef = useRef(false)
  const isSubmissionPending = useRef(false)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])
  const canApplyResponse = (sessionVersion: number) =>
    isMountedRef.current && getAuthSessionVersion() === sessionVersion

  const mutation = useMutation({
    retry: false,
    mutationFn: async ({
      profileDraft,
      sessionVersion,
    }: {
      profileDraft: ProfileDraft
      sessionVersion: number
    }) => {
      if (!canApplyResponse(sessionVersion)) {
        throw new Error('Onboarding session changed before submission')
      }
      const profileImageFile =
        profileDraft.profileImageChange.type === 'replace'
          ? profileDraft.profileImageChange.file
          : undefined
      const profileImageKey = profileImageFile
        ? await getUploadedProfileImageKey(profileImageFile)
        : undefined

      if (!canApplyResponse(sessionVersion)) {
        throw new Error('Onboarding session changed during submission')
      }
      return requestOnboarding(
        createOnboardingRequestBody(profileDraft, profileImageKey),
      )
    },
    onSuccess: ({ accessToken, userId }, { sessionVersion }) => {
      if (!canApplyResponse(sessionVersion)) return
      startAuthenticatedSession(accessToken, userId)
      navigateTo(getRedirectPath())
    },
    onError: (error, { sessionVersion }) => {
      if (!canApplyResponse(sessionVersion)) return
      if (
        checkHasHttpStatus(error) &&
        (error.status === 401 || error.status === 403)
      ) {
        clearAuthSession()
        navigateTo(ROUTES.loginRequired, { replace: true })
        return
      }

      if (
        !applyProfileApiError(error, {
          setFieldError,
          setFormError,
        })
      ) {
        setFormError(getErrorPresentation(error).message)
      }
    },
  })

  return {
    isPending: mutation.isPending,
    mutateAsync: async (profileDraft: ProfileDraft) => {
      if (isSubmissionPending.current) return
      isSubmissionPending.current = true
      const sessionVersion = getAuthSessionVersion()
      try {
        return await mutation.mutateAsync({ profileDraft, sessionVersion })
      } finally {
        isSubmissionPending.current = false
      }
    },
  }
}
