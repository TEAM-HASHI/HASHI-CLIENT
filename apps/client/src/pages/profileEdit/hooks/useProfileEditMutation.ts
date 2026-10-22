import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { useBlocker, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import type { ProfileDraft } from '@/features/profile/hooks/useProfileForm'
import {
  applyProfileApiError,
  type ProfileApiErrorHandlers,
} from '@/features/profile/utils/profileApiError'
import {
  MY_INFO_QUERY_KEY,
  MY_PROFILE_SUMMARY_QUERY_KEY,
} from '@/features/user'
import type { MyInfo } from '@/features/user/api/getMyInfo'
import {
  deleteProfileImage,
  updateProfile,
} from '@/pages/profileEdit/api/profileEditApi'
import { uploadProfileAsset } from '@/pages/profileEdit/api/uploadProfileAsset'
import { createProfileUpdateBody } from '@/pages/profileEdit/utils/createProfileUpdateBody'
import { checkIsAuthRequiredError, isApiError } from '@/shared/api/apiError'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import {
  clearAuthSession,
  getAuthSessionVersion,
  subscribeAuthSession,
  wasAuthSessionExpired,
} from '@/shared/auth/authSession'
import { captureError } from '@/shared/lib/sentry'

export const useProfileEditMutation = (
  initial: MyInfo,
  handlers: ProfileApiErrorHandlers,
) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [ownerVersion] = useState(getAuthSessionVersion)
  const currentVersion = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSessionVersion,
    getAuthSessionVersion,
  )
  const savedProfile = useRef(initial)
  const pending = useRef<{
    version: number
    controller: AbortController
  } | null>(null)
  const uploadedImage = useRef<{
    file: File
    assetId: string
    version: number
  } | null>(null)
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    const unsubscribe = subscribeAuthSession(() => {
      if (
        pending.current &&
        pending.current.version !== getAuthSessionVersion()
      )
        pending.current.controller.abort()
    })
    return () => {
      isMounted.current = false
      pending.current?.controller.abort()
      unsubscribe()
    }
  }, [])

  const mutation = useMutation({
    retry: false,
    mutationFn: async ({
      draft,
      version,
      signal,
    }: {
      draft: ProfileDraft
      version: number
      signal: AbortSignal
    }) => {
      const checkSession = () => {
        signal.throwIfAborted()
        if (getAuthSessionVersion() !== version)
          throw new Error('Profile session changed')
      }
      let didWrite = false
      try {
        checkSession()
        const saved = savedProfile.current
        const body = createProfileUpdateBody(draft, saved)
        if (draft.profileImageChange.type === 'replace') {
          const file = draft.profileImageChange.file
          const cached = uploadedImage.current
          const assetId =
            cached?.file === file && cached.version === version
              ? cached.assetId
              : await uploadProfileAsset(file, signal)
          checkSession()
          uploadedImage.current = { file, assetId, version }
          body.profileImageAssetId = assetId
        }
        checkSession()
        if (Object.keys(body).length > 0) {
          await updateProfile(body, signal)
          didWrite = true
          checkSession()
          savedProfile.current = {
            ...saved,
            nickname: draft.nickname,
            englishName: draft.englishName,
            email: draft.email,
            phoneNumber: draft.phoneNumber,
            birthDate: draft.birthDate,
          }
        }
        checkSession()
        if (draft.profileImageChange.type === 'delete') {
          await deleteProfileImage(signal)
          didWrite = true
        }
      } finally {
        if (didWrite && getAuthSessionVersion() === version) {
          await Promise.allSettled([
            queryClient.invalidateQueries({ queryKey: MY_INFO_QUERY_KEY }),
            queryClient.invalidateQueries({
              queryKey: MY_PROFILE_SUMMARY_QUERY_KEY,
            }),
          ])
        }
      }
    },
    onSuccess: (_data, { version }) => {
      if (isMounted.current && getAuthSessionVersion() === version) {
        pending.current = null
        navigate(ROUTES.mypage)
      }
    },
    onError: (error, { version }) => {
      if (!isMounted.current) return
      const isAuthError =
        checkIsAuthRequiredError(error) ||
        (isApiError(error) && error.code === 'USER-005')
      if (
        getAuthSessionVersion() !== version &&
        !(isAuthError && wasAuthSessionExpired(version))
      )
        return
      if (isAuthError) {
        pending.current = null
        queryClient.clear()
        clearAuthSession()
        navigate(ROUTES.loginRequired, { replace: true })
        return
      }
      captureError(error)
      if (
        isApiError(error) &&
        ['MEDIA-001', 'MEDIA-005', 'MEDIA-006', 'MEDIA-007'].includes(
          error.code,
        )
      )
        uploadedImage.current = null
      if (!applyProfileApiError(error, handlers))
        handlers.setFormError(getErrorPresentation(error).message)
    },
    onSettled: () => {
      pending.current = null
    },
  })

  const shouldBlock = useCallback(
    () => pending.current?.version === getAuthSessionVersion(),
    [],
  )
  const blocker = useBlocker(shouldBlock)
  useEffect(() => {
    if (blocker.state === 'blocked') blocker.reset()
  }, [blocker])

  return {
    isPending: mutation.isPending && ownerVersion === currentVersion,
    isCurrentSession: ownerVersion === currentVersion,
    handleBack: () => {
      if (!shouldBlock()) navigate(ROUTES.mypage)
    },
    submit: (draft: ProfileDraft) => {
      if (pending.current || ownerVersion !== getAuthSessionVersion()) return
      const controller = new AbortController()
      pending.current = { version: ownerVersion, controller }
      mutation.mutate({
        draft,
        version: ownerVersion,
        signal: controller.signal,
      })
    },
  }
}
