import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { AuthOnlyRoute } from '@/app/router/RouteGuards'
import {
  clearAuthSession,
  setAccessToken,
  setOnboardingSession,
} from '@/features/auth/session/authSession'

const renderProfileNewRoute = () => {
  return render(
    <MemoryRouter initialEntries={[ROUTES.profileNew]}>
      <Routes>
        <Route element={<AuthOnlyRoute />}>
          <Route element={<p>profile creation</p>} path={ROUTES.profileNew} />
        </Route>
        <Route element={<p>home</p>} path={ROUTES.home} />
        <Route element={<p>login required</p>} path={ROUTES.loginRequired} />
      </Routes>
    </MemoryRouter>,
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
})
