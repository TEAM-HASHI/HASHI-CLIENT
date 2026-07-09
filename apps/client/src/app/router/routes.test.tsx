import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { appRoutes } from '@/app/router/routes'

const renderRoute = (initialEntry: string) => {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [initialEntry],
  })

  return render(<RouterProvider router={router} />)
}

describe('appRoutes', () => {
  afterEach(() => {
    cleanup()
    document.body.style.overflow = ''
  })

  it('renders HashiPickPage from a direct URL entry', async () => {
    renderRoute(ROUTES.hashiPickRestaurants)

    expect(
      await screen.findByRole('heading', { name: '하시 Pick' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: '404 페이지' }),
    ).not.toBeInTheDocument()
  })

  it('renders PopularRestaurantsPage from a direct URL entry', async () => {
    renderRoute(ROUTES.popularRestaurants)

    expect(
      await screen.findByRole('heading', { name: '인기 맛집' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: '404 페이지' }),
    ).not.toBeInTheDocument()
  })
})
