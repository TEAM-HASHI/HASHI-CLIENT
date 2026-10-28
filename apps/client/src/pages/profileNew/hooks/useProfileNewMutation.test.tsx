import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { ProfileDraft } from '@/features/profile/hooks/useProfileForm'
import { requestOnboarding } from '@/pages/profileNew/api/requestOnboarding'
import { useProfileNewMutation } from '@/pages/profileNew/hooks/useProfileNewMutation'
import { HttpStatusError } from '@/shared/api/apiError'
import {
  clearAuthSession,
  getAccessToken,
  setOnboardingSession,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

vi.mock('@/pages/profileNew/api/requestOnboarding', () => ({
  requestOnboarding: vi.fn(),
}))

const draft: ProfileDraft = {
  profileImageChange: { type: 'keep' },
  nickname: '새 사용자',
  birthDate: '2000/01/01',
  phoneNumber: '010-1234-5678',
  email: 'user@example.com',
}

const setup = () => {
  setOnboardingSession()
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  const navigateTo = vi.fn()
  const setFieldError = vi.fn()
  const setFormError = vi.fn()
  const getUploadedProfileImageKey = vi.fn<() => Promise<string>>()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const hook = renderHook(
    () =>
      useProfileNewMutation({
        getRedirectPath: () => '/',
        getUploadedProfileImageKey,
        navigateTo,
        setFieldError,
        setFormError,
      }),
    { wrapper },
  )
  return {
    ...hook,
    navigateTo,
    setFieldError,
    setFormError,
    getUploadedProfileImageKey,
  }
}

afterEach(() => {
  cleanup()
  clearAuthSession()
  vi.resetAllMocks()
})

describe('useProfileNewMutation session conflicts', () => {
  it.each(['keep', 'replace'] as const)(
    'does not upload or submit a %s draft when the session changes before dispatch',
    async (imageChange) => {
      const {
        result,
        getUploadedProfileImageKey,
        navigateTo,
        setFieldError,
        setFormError,
      } = setup()
      getUploadedProfileImageKey.mockResolvedValue('uploaded-key')
      vi.mocked(requestOnboarding).mockResolvedValue({
        userId: 1,
        accessToken: 'old-token',
      })
      await act(async () => {
        const completion = result.current
          .mutateAsync({
            ...draft,
            profileImageChange:
              imageChange === 'replace'
                ? { type: 'replace', file: new File(['image'], 'profile.png') }
                : { type: 'keep' },
          })
          .catch(() => undefined)
        startAuthenticatedSession('new-session')
        await completion
      })
      expect(requestOnboarding).not.toHaveBeenCalled()
      expect(getUploadedProfileImageKey).not.toHaveBeenCalled()
      expect(getAccessToken()).toBe('new-session')
      expect(navigateTo).not.toHaveBeenCalled()
      expect(setFieldError).not.toHaveBeenCalled()
      expect(setFormError).not.toHaveBeenCalled()
    },
  )

  it.each([
    ['new-login', 'success'],
    ['new-login', 401],
    ['new-login', 403],
    ['unmount', 'success'],
    ['unmount', 401],
    ['unmount', 403],
  ] as const)(
    'ignores a late onboarding response after %s (%s)',
    async (change, outcome) => {
      let resolveRequest!: (
        value: Awaited<ReturnType<typeof requestOnboarding>>,
      ) => void
      let rejectRequest!: (cause: Error) => void
      vi.mocked(requestOnboarding).mockImplementationOnce(
        () =>
          new Promise((resolve, reject) => {
            resolveRequest = resolve
            rejectRequest = reject
          }),
      )
      const { result, unmount, navigateTo, setFieldError, setFormError } =
        setup()
      let completion!: Promise<unknown>
      await act(async () => {
        completion = result.current.mutateAsync(draft).catch(() => undefined)
      })
      await waitFor(() => expect(requestOnboarding).toHaveBeenCalledOnce())
      if (change === 'new-login') startAuthenticatedSession('new-session')
      else unmount()
      await act(async () => {
        if (outcome === 'success')
          resolveRequest({ userId: 1, accessToken: 'old-onboarding-token' })
        else rejectRequest(new HttpStatusError(outcome))
        await completion
      })
      expect(getAccessToken()).toBe(
        change === 'new-login' ? 'new-session' : undefined,
      )
      expect(navigateTo).not.toHaveBeenCalled()
      expect(setFieldError).not.toHaveBeenCalled()
      expect(setFormError).not.toHaveBeenCalled()
    },
  )

  it('does not submit onboarding after the session changes during image upload', async () => {
    let resolveUpload!: (key: string) => void
    const { result, getUploadedProfileImageKey, navigateTo, setFormError } =
      setup()
    getUploadedProfileImageKey.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveUpload = resolve
        }),
    )
    let completion!: Promise<unknown>
    await act(async () => {
      completion = result.current
        .mutateAsync({
          ...draft,
          profileImageChange: {
            type: 'replace',
            file: new File(['image'], 'profile.png'),
          },
        })
        .catch(() => undefined)
    })
    await waitFor(() =>
      expect(getUploadedProfileImageKey).toHaveBeenCalledOnce(),
    )
    startAuthenticatedSession('new-session')
    vi.mocked(requestOnboarding).mockResolvedValueOnce({
      userId: 1,
      accessToken: 'old-token',
    })
    await act(async () => {
      resolveUpload('uploaded-key')
      await completion
    })
    expect(requestOnboarding).not.toHaveBeenCalled()
    expect(getAccessToken()).toBe('new-session')
    expect(navigateTo).not.toHaveBeenCalled()
    expect(setFormError).not.toHaveBeenCalled()
  })
})
