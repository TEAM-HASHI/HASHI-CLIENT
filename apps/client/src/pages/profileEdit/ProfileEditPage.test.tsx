import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'

import { MY_INFO_QUERY_KEY } from '@/features/user'
import { ProfileEditPage } from '@/pages/profileEdit/ProfileEditPage'
import { request } from '@/shared/api/request'
import {
  clearAuthSession,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))

afterEach(() => {
  cleanup()
  clearAuthSession()
  vi.resetAllMocks()
})

it('preserves edited fields when a background refetch fails under the global error boundary policy', async () => {
  startAuthenticatedSession('test-token')
  let failRefetch = false
  vi.mocked(request).mockImplementation(async () => {
    if (failRefetch) throw new Error('Profile refetch failed')
    return {
      nickname: '하시',
      nameEng: 'HASHI',
      birthDate: '1998-05-12',
      phone: '01012345678',
      email: 'hashi@example.com',
      profileImageUrl: null,
    }
  })
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, throwOnError: true } },
  })
  const router = createMemoryRouter([
    { path: '/', element: <ProfileEditPage />, errorElement: <p>오류 화면</p> },
  ])
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  await screen.findByRole('textbox', { name: '생년월일' })
  fireEvent.change(screen.getByRole('textbox', { name: '생년월일' }), {
    target: { value: '19990101' },
  })
  failRefetch = true
  await act(async () => {
    await client.invalidateQueries({ queryKey: MY_INFO_QUERY_KEY })
  })
  await waitFor(() =>
    expect(client.getQueryState(MY_INFO_QUERY_KEY)?.status).toBe('error'),
  )
  expect(screen.queryByText('오류 화면')).not.toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: '생년월일' })).toHaveValue(
    '1999/01/01',
  )
  expect(screen.getByRole('button', { name: '저장' })).toBeEnabled()
})
