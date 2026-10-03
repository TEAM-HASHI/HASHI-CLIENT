import '@testing-library/jest-dom/vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('renders the public map preview and bottom navigation on direct entry', async () => {
    renderRoute(ROUTES.map)

    expect(
      await screen.findByRole('heading', { name: '도쿄 맛집 지도' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('searchbox', { name: '식당 혹은 메뉴 검색' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('removes covered navigation from accessibility when map detail fills the screen', async () => {
    const user = userEvent.setup()
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 393,
        bottom: 768,
        width: 393,
        height: 768,
        toJSON: () => ({}),
      })
    try {
      renderRoute(ROUTES.map)
      await user.click(
        await screen.findByRole('button', {
          name: '코코네 돈카츠 신도심점 상세 보기',
        }),
      )
      screen.getByRole('slider', { name: '식당 상세 높이 조절' }).focus()
      await user.keyboard('{End}')
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
      await user.keyboard('{Escape}')
      expect(screen.getByRole('navigation')).toBeVisible()
    } finally {
      rect.mockRestore()
    }
  })
})
