import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { AuthOnlyRoute, GuestOnlyRoute } from '@/app/router/RouteGuards'
import { AuthSessionRestoreContext } from '@/features/auth/session/AuthSessionRestoreContext'
import {
  clearAuthSession,
  setAccessToken,
  setOnboardingSession,
} from '@/features/auth/session/authSession'

const renderProfileNewRoute = (isRestoring = false) => {
  return render(
    <AuthSessionRestoreContext.Provider value={{ isRestoring }}>
      <MemoryRouter initialEntries={[ROUTES.profileNew]}>
        <Routes>
          <Route element={<AuthOnlyRoute />}>
            <Route element={<p>profile creation</p>} path={ROUTES.profileNew} />
          </Route>
          <Route element={<p>home</p>} path={ROUTES.home} />
          <Route element={<p>login required</p>} path={ROUTES.loginRequired} />
        </Routes>
      </MemoryRouter>
    </AuthSessionRestoreContext.Provider>,
  )
}

const renderLoginRequiredRoute = (isRestoring = false) => {
  return render(
    <AuthSessionRestoreContext.Provider value={{ isRestoring }}>
      <MemoryRouter initialEntries={[ROUTES.loginRequired]}>
        <Routes>
          <Route element={<GuestOnlyRoute />}>
            <Route
              element={<p>login required</p>}
              path={ROUTES.loginRequired}
            />
          </Route>
          <Route element={<p>home</p>} path={ROUTES.home} />
        </Routes>
      </MemoryRouter>
    </AuthSessionRestoreContext.Provider>,
  )
}

describe('AuthOnlyRoute', () => {
  afterEach(() => {
    cleanup()
    clearAuthSession()
  })

  it('redirects an authenticated member away from the onboarding-only profile route', () => {
    setAccessToken('access-token')

    renderProfileNewRoute()

    expect(screen.getByText('home')).toBeInTheDocument()
    expect(screen.queryByText('profile creation')).not.toBeInTheDocument()
  })

  it('allows an onboarding session to access the profile creation route', () => {
    setOnboardingSession()

    renderProfileNewRoute()

    expect(screen.getByText('profile creation')).toBeInTheDocument()
  })

  it('redirects an unauthenticated user to login-required', () => {
    renderProfileNewRoute()

    expect(screen.getByText('login required')).toBeInTheDocument()
  })

  it('waits for auth restoration before deciding a protected route redirect', () => {
    renderProfileNewRoute(true)

    expect(screen.queryByText('profile creation')).not.toBeInTheDocument()
    expect(screen.queryByText('login required')).not.toBeInTheDocument()
  })

  it('waits for auth restoration before deciding a guest-only route redirect', () => {
    setAccessToken('access-token')

    renderLoginRequiredRoute(true)

    expect(screen.queryByText('login required')).not.toBeInTheDocument()
    expect(screen.queryByText('home')).not.toBeInTheDocument()
  })
})
