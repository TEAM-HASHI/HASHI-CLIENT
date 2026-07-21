import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AdminOnlyRoute } from '@/app/router/RouteGuards'
import { clearAdminSession, setAdminSession } from '@/shared/auth/adminSession'

describe('AdminOnlyRoute', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setAdminSession({
      accessToken: 'expired-token',
      issuedAt: '2026-07-17T00:00:00Z',
      loginId: 'hashi-admin',
    })
  })

  it('redirects when the mounted admin session is cleared', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route element={<AdminOnlyRoute />}>
            <Route
              path="/admin/dashboard"
              element={
                <button type="button" onClick={clearAdminSession}>
                  세션 만료
                </button>
              }
            />
          </Route>
          <Route path="/admin/login" element={<p>로그인 화면</p>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: '세션 만료' }))

    expect(await screen.findByText('로그인 화면')).toBeInTheDocument()
  })
})
