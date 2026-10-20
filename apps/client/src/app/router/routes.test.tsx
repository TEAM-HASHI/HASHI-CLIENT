import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { appRoutes } from '@/app/router/routes'
import { getRestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import type { PropsWithChildren } from 'react'
import { clearAuthSession, setAccessToken } from '@/shared/auth/authSession'
import { createQueryClient } from '@/shared/lib/queryClient'

vi.mock('@/features/restaurantDetail/api/getRestaurantSummary', () => ({
  getRestaurantSummary: vi.fn(),
}))

vi.mock('@/app/providers/AuthSessionRestoreGate', () => ({
  AuthSessionRestoreGate: ({ children }: PropsWithChildren) => children,
}))

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

const renderRoute = async (initialEntry: string) => {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [initialEntry],
  })
  const queryClient = createQueryClient()

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  await act(async () => {
    await vi.dynamicImportSettled()
  })
  return { router }
}

describe('appRoutes', () => {
  it('컬렉션 식당을 누르면 실제 상세 경로로 이동하고 목 ID는 API 조회 없이 404로 처리한다', async () => {
    setAccessToken('test-session')
    const { router } = await renderRoute('/saved/collections/spring')
    const user = userEvent.setup()
    await user.click(
      await screen.findByRole('button', {
        name: /^히마와리 스시 신도심점 4\.8/,
      }),
    )
    await act(async () => {
      await vi.dynamicImportSettled()
    })
    expect(router.state.location.pathname).toBe('/restaurants/sushi')
    expect(
      await screen.findByRole('heading', { name: '404 페이지' }),
    ).toBeVisible()
    expect(getRestaurantSummary).not.toHaveBeenCalled()
  })

  afterEach(() => {
    cleanup()
    document.body.style.overflow = ''
    clearAuthSession()
  })

  it.each([
    ['/saved', '저장 컬렉션', false],
    ['/saved/collections/spring', '2026 도쿄 봄 여행', false],
    ['/saved/collections/new', '새 컬렉션 만들기', true],
    ['/saved/collections/spring/edit', '컬렉션 수정', true],
    ['/saved/collections/spring/restaurants/edit', '컬렉션 편집', true],
  ] as const)(
    '실제 appRoutes에서 인증된 사용자의 %s를 올바른 레이아웃으로 연다',
    async (path, name, form) => {
      setAccessToken('test-session')
      await renderRoute(path)
      expect(
        await screen.findByRole(form ? 'region' : 'heading', { name }),
      ).toBeVisible()
      if (form) expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
      else
        expect(screen.getByRole('button', { name: '저장' })).toHaveAttribute(
          'aria-current',
          'page',
        )
    },
  )

  it('renders HashiPickPage from a direct URL entry', async () => {
    await renderRoute(ROUTES.hashiPickRestaurants)

    expect(
      await screen.findByRole('heading', { name: '하시 Pick' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: '404 페이지' }),
    ).not.toBeInTheDocument()
  })

  it('renders PopularRestaurantsPage from a direct URL entry', async () => {
    await renderRoute(ROUTES.popularRestaurants)

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

  it('registers notice list and detail as app routes', () => {
    const routePaths = collectRoutePaths(appRoutes)

    expect(routePaths).toContain(ROUTES.notices)
    expect(routePaths).toContain(ROUTES.noticeDetail)
  })

  it('registers reservation complete as an app route', () => {
    expect(collectRoutePaths(appRoutes)).toContain(ROUTES.reservationComplete)
  })

  it('registers terms list and detail as app routes', () => {
    const routePaths = collectRoutePaths(appRoutes)

    expect(routePaths).toContain(ROUTES.terms)
    expect(routePaths).toContain(ROUTES.termsDetail)
  })
})
