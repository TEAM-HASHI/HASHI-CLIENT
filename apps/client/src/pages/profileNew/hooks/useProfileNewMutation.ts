import { useMutation } from '@tanstack/react-query'

import { ROUTES } from '@/app/router/path'
import {
  clearAuthSession,
  setAccessToken,
} from '@/features/auth/session/authSession'
import { requestOnboarding } from '@/pages/profileNew/api/requestOnboarding'
import type { ProfileDraft } from '@/pages/profileNew/hooks/useProfileNewForm'
import { createOnboardingRequestBody } from '@/pages/profileNew/utils/profileNewForm'
import {
  mapProfileNewOnboardingError,
  type ProfileNewOnboardingErrorHandlers,
} from '@/pages/profileNew/utils/profileNewOnboardingError'
import { checkHasHttpStatus } from '@/shared/api/apiError'

interface UseProfileNewMutationOptions {
  getRedirectPath: () => string
  getUploadedProfileImageKey: (file: File) => Promise<string>
  navigateTo: (to: string, options?: { replace?: boolean }) => void
  onUnhandledError: (error: unknown) => void
  setFieldError: ProfileNewOnboardingErrorHandlers['setFieldError']
  setFormError: ProfileNewOnboardingErrorHandlers['setFormError']
}

export const useProfileNewMutation = ({
  getRedirectPath,
  getUploadedProfileImageKey,
  navigateTo,
  onUnhandledError,
  setFieldError,
  setFormError,
}: UseProfileNewMutationOptions) => {
  return useMutation({
    mutationFn: async (profileDraft: ProfileDraft) => {
      const profileImageFile = profileDraft.profileImageFile
      const profileImageKey = profileImageFile
        ? await getUploadedProfileImageKey(profileImageFile)
        : undefined

      return requestOnboarding(
        createOnboardingRequestBody(profileDraft, profileImageKey),
      )
    },
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken)
      navigateTo(getRedirectPath())
    },
    onError: (error) => {
      if (
        checkHasHttpStatus(error) &&
        (error.status === 401 || error.status === 403)
      ) {
        clearAuthSession()
        navigateTo(ROUTES.loginRequired, { replace: true })
        return
      }

      if (
        !mapProfileNewOnboardingError(error, {
          setFieldError,
          setFormError,
        })
      ) {
        onUnhandledError(error)
      }
    },
  })
}
