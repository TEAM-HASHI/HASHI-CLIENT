import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { appRoutes } from '@/app/router/routes'

vi.mock('@/pages/loginRequired', () => new Promise(() => {}))

describe('route lazy fallback', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders LoadingScreen without bottom navigation for a configured lazy route while its module is pending', () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/login-required'],
    })

    render(<RouterProvider router={router} />)

    expect(screen.getByRole('status')).toHaveTextContent('로딩 중이에요')
    expect(screen.queryByText('홈')).not.toBeInTheDocument()
    expect(screen.queryByText('마이')).not.toBeInTheDocument()
  })
})
