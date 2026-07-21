import '@testing-library/jest-dom/vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { appRoutes } from '@/app/router/routes'
import { createQueryClient } from '@/shared/lib/queryClient'

vi.mock('@/features/magazine/api/getMagazineBanners', () => ({
  getMagazineBanners: vi.fn(async () => ({ banners: [] })),
}))

vi.mock('@/features/restaurantList/api/getRestaurants', () => ({
  getRestaurants: vi.fn(async () => ({
    hasNext: false,
    nextCursor: undefined,
    restaurants: [],
  })),
}))

const collectRoutePaths = (routes: typeof appRoutes): string[] => {
  return routes.flatMap((route) => [
    ...(route.path ? [route.path] : []),
    ...(route.children ? collectRoutePaths(route.children) : []),
  ])
}

const renderRoute = (initialEntry: string) => {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [initialEntry],
  })
  const queryClient = createQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
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

  it('registers Kakao OAuth callback as an app route', () => {
    expect(collectRoutePaths(appRoutes)).toContain(ROUTES.kakaoOAuthCallback)
  })

  it('registers reservation rescue as an app route', () => {
    expect(collectRoutePaths(appRoutes)).toContain(ROUTES.reservationRescue)
  })
})
