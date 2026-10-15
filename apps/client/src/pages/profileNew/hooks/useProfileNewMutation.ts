import { useMutation } from '@tanstack/react-query'

import { ROUTES } from '@/app/router/path'
import { clearAuthSession, setAccessToken } from '@/shared/auth/authSession'
import { requestOnboarding } from '@/pages/profileNew/api/requestOnboarding'
import type { ProfileDraft } from '@/features/profile/hooks/useProfileForm'
import { createOnboardingRequestBody } from '@/pages/profileNew/utils/profileNewForm'
import {
  applyProfileNewOnboardingError,
  type ProfileNewOnboardingErrorHandlers,
} from '@/pages/profileNew/utils/profileNewOnboardingError'
import { checkHasHttpStatus } from '@/shared/api/apiError'
import { getErrorPresentation } from '@/shared/api/errorPresentation'

interface UseProfileNewMutationOptions {
  getRedirectPath: () => string
  getUploadedProfileImageKey: (file: File) => Promise<string>
  navigateTo: (to: string, options?: { replace?: boolean }) => void
  setFieldError: ProfileNewOnboardingErrorHandlers['setFieldError']
  setFormError: ProfileNewOnboardingErrorHandlers['setFormError']
}

export const useProfileNewMutation = ({
  getRedirectPath,
  getUploadedProfileImageKey,
  navigateTo,
  setFieldError,
  setFormError,
}: UseProfileNewMutationOptions) => {
  return useMutation({
    mutationFn: async (profileDraft: ProfileDraft) => {
      const profileImageFile =
        profileDraft.profileImageChange.type === 'replace'
          ? profileDraft.profileImageChange.file
          : undefined
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
        !applyProfileNewOnboardingError(error, {
          setFieldError,
          setFormError,
        })
      ) {
        setFormError(getErrorPresentation(error).message)
      }
    },
  })
}
