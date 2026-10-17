import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'

import { useProfileAvailability } from '@/features/profile/hooks/useProfileAvailability'
import { request } from '@/shared/api/request'
import {
  clearAuthSession,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))

const initial = {
  nickname: '하시',
  phoneNumber: '01012345678',
  email: 'hashi@example.com',
}
const setup = () => {
  startAuthenticatedSession('token')
  const client = new QueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return renderHook(({ values }) => useProfileAvailability(values, initial), {
    wrapper,
    initialProps: { values: initial },
  })
}

afterEach(() => {
  cleanup()
  clearAuthSession()
  vi.resetAllMocks()
  vi.useRealTimers()
})

it('ignores an older duplicate result and blocks saving until the current value has been checked', async () => {
  let resolveOld!: (value: unknown) => void
  vi.mocked(request).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveOld = resolve
      }),
  )
  const { result, rerender } = setup()
  expect(request).not.toHaveBeenCalled()
  rerender({ values: { ...initial, nickname: '첫 입력' } })
  expect(result.current.canSubmit).toBe(false)
  act(() => result.current.nickname.onBlur())
  await waitFor(() => expect(request).toHaveBeenCalledTimes(1))
  rerender({ values: { ...initial, nickname: '새 입력' } })
  expect(result.current.canSubmit).toBe(false)
  vi.mocked(request).mockResolvedValueOnce({ nickname: { available: true } })
  act(() => result.current.nickname.onBlur())
  await waitFor(() => expect(result.current.canSubmit).toBe(true))
  await act(async () =>
    resolveOld({ nickname: { available: false, message: '이전 입력 중복' } }),
  )
  expect(result.current.nickname.errorMessage).toBe('')
  expect(result.current.canSubmit).toBe(true)
  rerender({ values: initial })
  expect(result.current.canSubmit).toBe(true)
  expect(request).toHaveBeenCalledTimes(2)
})

it('blocks saving on a failed check and retries on blur without losing the entered value', async () => {
  vi.mocked(request).mockRejectedValueOnce(new Error('network'))
  const { result, rerender } = setup()
  rerender({ values: { ...initial, email: 'new@example.com' } })
  act(() => result.current.email.onBlur())
  await waitFor(() => expect(result.current.email.errorMessage).not.toBe(''))
  expect(result.current.canSubmit).toBe(false)
  vi.mocked(request).mockResolvedValueOnce({ email: { available: true } })
  act(() => result.current.email.onBlur())
  await waitFor(() => expect(result.current.canSubmit).toBe(true))
  expect(request).toHaveBeenLastCalledWith(
    'api/v1/users/availability',
    expect.objectContaining({ json: { email: 'new@example.com' } }),
  )
})

it('debounces changing input and sends only the latest field value after 500ms', async () => {
  vi.useFakeTimers()
  vi.mocked(request).mockResolvedValue({ nickname: { available: true } })
  const { result, rerender } = setup()
  rerender({ values: { ...initial, nickname: '첫 입력' } })
  await act(async () => {
    await vi.advanceTimersByTimeAsync(400)
  })
  expect(request).not.toHaveBeenCalled()
  rerender({ values: { ...initial, nickname: '최종 입력' } })
  await act(async () => {
    await vi.advanceTimersByTimeAsync(499)
  })
  expect(result.current.canSubmit).toBe(false)
  expect(request).not.toHaveBeenCalled()
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1)
  })
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })
  expect(request).toHaveBeenCalledOnce()
  expect(request).toHaveBeenLastCalledWith(
    'api/v1/users/availability',
    expect.objectContaining({ json: { nickname: '최종 입력' } }),
  )
})
