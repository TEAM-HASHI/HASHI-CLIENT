import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'

import {
  MY_INFO_QUERY_KEY,
  MY_PROFILE_SUMMARY_QUERY_KEY,
} from '@/features/user'
import { useProfileEditPage } from '@/pages/profileEdit/hooks/useProfileEditPage'
import { ApiError } from '@/shared/api/apiError'
import { request } from '@/shared/api/request'
import {
  clearAuthSession,
  getAccessToken,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))

const initial = {
  nickname: '하시',
  englishName: 'HASHI',
  birthDate: '1998-05-12',
  phoneNumber: '01012345678',
  email: 'hashi@example.com',
  profileImageUrl: 'https://example.com/profile.png',
}
const failure = (code: string, message: string) =>
  new ApiError(
    { success: false, code, message, data: null, timestamp: '', path: '' },
    409,
  )
const setup = () => {
  startAuthenticatedSession('old-token')
  const client = new QueryClient()
  client.setQueryData(MY_INFO_QUERY_KEY, initial)
  client.setQueryData(MY_PROFILE_SUMMARY_QUERY_KEY, { nickname: '하시' })
  let router: ReturnType<typeof createMemoryRouter>
  const wrapper = ({ children }: { children: ReactNode }) => {
    router = createMemoryRouter(
      [
        { path: '/profile/edit', element: children },
        { path: '/mypage', element: <div>마이페이지</div> },
        { path: '/login-required', element: <div>로그인</div> },
      ],
      { initialEntries: ['/profile/edit'] },
    )
    return (
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )
  }
  const hook = renderHook(() => useProfileEditPage(initial), { wrapper })
  return { ...hook, client, getPath: () => router.state.location.pathname }
}
const submitEvent = { preventDefault: vi.fn() } as never

afterEach(() => {
  cleanup()
  clearAuthSession()
  vi.resetAllMocks()
})

it('deduplicates submission and saves a reverted field after a partial save failure', async () => {
  let resolvePatch!: () => void
  vi.mocked(request).mockImplementation(async (path, options) => {
    if (path === 'api/v1/users/me' && options?.method === 'patch') {
      await new Promise<void>((resolve) => {
        resolvePatch = resolve
      })
      return null
    }
    if (path === 'api/v1/users/me/profile-image')
      throw new Error('delete failed')
    throw new Error(`Unexpected request: ${path}`)
  })
  const { result, client, getPath } = setup()
  act(() => {
    result.current.form.fields.birthDate.onValueChange('19990101')
    result.current.form.profileImage.onDelete()
  })
  act(() => {
    result.current.handleSubmit(submitEvent)
    result.current.handleSubmit(submitEvent)
  })
  await waitFor(() => expect(request).toHaveBeenCalledTimes(1))
  expect(result.current.isSubmitting).toBe(true)
  await act(async () => resolvePatch())
  await waitFor(() => expect(result.current.isSubmitting).toBe(false))
  expect(result.current.form.fields.birthDate.value).toBe('1999/01/01')
  expect(result.current.form.profileImage.previewUrl).toBeUndefined()
  expect(result.current.form.formError).not.toBe('')
  expect(getPath()).toBe('/profile/edit')
  expect(client.getQueryState(MY_INFO_QUERY_KEY)?.isInvalidated).toBe(true)
  expect(
    client.getQueryState(MY_PROFILE_SUMMARY_QUERY_KEY)?.isInvalidated,
  ).toBe(true)
  act(() => result.current.form.fields.birthDate.onValueChange('19980512'))
  vi.mocked(request).mockResolvedValue(null)
  act(() => result.current.handleSubmit(submitEvent))
  await waitFor(() => expect(getPath()).toBe('/mypage'))
  expect(request).toHaveBeenLastCalledWith(
    'api/v1/users/me/profile-image',
    expect.anything(),
  )
  const patch = vi
    .mocked(request)
    .mock.calls.filter(([, options]) => options?.method === 'patch')
    .at(-1)
  expect(patch?.[1]?.json).toEqual({ birthDate: '1998-05-12' })
})

it('maps a save-time duplicate to the field using the server message and retains the input', async () => {
  vi.mocked(request).mockImplementation(async (path) => {
    if (path === 'api/v1/users/availability')
      return { nickname: { available: true } }
    throw failure('USER-001', '서버에서 판단한 중복 닉네임입니다.')
  })
  const { result, getPath } = setup()
  act(() => result.current.form.fields.nickname.onValueChange('새 닉네임'))
  act(() => result.current.fields.nickname.onBlur?.())
  await waitFor(() => expect(result.current.canSubmit).toBe(true))
  act(() => result.current.handleSubmit(submitEvent))
  await waitFor(() =>
    expect(result.current.form.fields.nickname.errorMessage).toBe(
      '서버에서 판단한 중복 닉네임입니다.',
    ),
  )
  expect(result.current.form.fields.nickname.value).toBe('새 닉네임')
  expect(result.current.canSubmit).toBe(false)
  expect(getPath()).toBe('/profile/edit')
})

it('does not delete the image or mutate a new session when the account changes during saving', async () => {
  let resolvePatch!: () => void
  vi.mocked(request).mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        resolvePatch = resolve
      }) as never,
  )
  const { result, client, getPath } = setup()
  act(() => {
    result.current.form.fields.birthDate.onValueChange('19990101')
    result.current.form.profileImage.onDelete()
  })
  act(() => result.current.handleSubmit(submitEvent))
  await waitFor(() => expect(request).toHaveBeenCalledOnce())
  act(() => {
    startAuthenticatedSession('new-token')
    client.setQueryData(MY_INFO_QUERY_KEY, { nickname: '새 사용자' })
  })
  await act(async () => resolvePatch())
  await waitFor(() => expect(result.current.isSubmitting).toBe(false))
  expect(request).toHaveBeenCalledOnce()
  expect(getAccessToken()).toBe('new-token')
  expect(client.getQueryData(MY_INFO_QUERY_KEY)).toEqual({
    nickname: '새 사용자',
  })
  expect(client.getQueryState(MY_INFO_QUERY_KEY)?.isInvalidated).toBe(false)
  expect(getPath()).toBe('/profile/edit')
  expect(result.current.form.formError).toBe('')
})
