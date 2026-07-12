import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from '@/pages/login/LoginPage'
import { authApi } from '@/shared/api/authApi'
import { getAdminSession } from '@/shared/auth/adminSession'

vi.mock('@/shared/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

const loginMock = vi.mocked(authApi.login)

const renderLoginPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/login']}>
        <Routes>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={<p>대시보드 진입</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    loginMock.mockReset()
  })

  it('shows logo-focused branding without implementation copy', () => {
    renderLoginPage()

    const brandMarks = screen.getAllByRole('img', {
      name: 'HASHI Admin 로고',
    })

    expect(brandMarks).toHaveLength(2)
    expect(brandMarks[0]).toHaveClass('size-40')
    expect(brandMarks[1]).toHaveClass('size-20')
    expect(
      screen.queryByText('운영 데이터를 빠르게 확인하고 조치합니다.'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('예약, 식당, 매거진을 API 기준으로 관리하세요.'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(
        '관리자 계정으로 로그인하면 실제 운영 API에 연결됩니다.',
      ),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('HASHI-91 Admin Console')).not.toBeInTheDocument()
  })

  it('logs in with login ID and stores the returned session', async () => {
    const user = userEvent.setup()
    loginMock.mockResolvedValue({
      accessToken: 'admin-token',
      issuedAt: '2026-07-12T00:00:00Z',
      loginId: 'hashi-admin',
    })
    renderLoginPage()

    await user.type(screen.getByLabelText('로그인 ID'), 'hashi-admin')
    await user.type(screen.getByLabelText('비밀번호'), 'password')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(loginMock.mock.calls[0]?.[0]).toEqual({
      loginId: 'hashi-admin',
      password: 'password',
    })
    expect(await screen.findByText('대시보드 진입')).toBeInTheDocument()
    expect(getAdminSession()).toMatchObject({
      accessToken: 'admin-token',
      loginId: 'hashi-admin',
    })
  })

  it('shows the backend login error inline', async () => {
    const user = userEvent.setup()
    loginMock.mockRejectedValue(new Error('관리자 계정 정보를 확인해주세요.'))
    renderLoginPage()

    await user.type(screen.getByLabelText('로그인 ID'), 'hashi-admin')
    await user.type(screen.getByLabelText('비밀번호'), 'wrong')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() =>
      expect(
        screen.getByText('관리자 계정 정보를 확인해주세요.'),
      ).toBeInTheDocument(),
    )
  })
})
