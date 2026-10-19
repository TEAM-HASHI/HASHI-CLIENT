import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createCollection } from '@/pages/saved/api/createCollection'
import { updateCollection } from '@/pages/saved/api/updateCollection'
import { deleteCollection } from '@/pages/saved/api/deleteCollection'
import { getCollection } from '@/pages/saved/api/getCollection'
import { getCollections } from '@/pages/saved/api/getCollections'
import { getSavedRestaurants } from '@/pages/saved/api/getSavedRestaurants'

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

vi.mock('@/pages/saved/api/getCollection', () => ({ getCollection: vi.fn() }))
vi.mock('@/pages/saved/api/getCollections', () => ({ getCollections: vi.fn() }))
vi.mock('@/pages/saved/api/getSavedRestaurants', () => ({
  getSavedRestaurants: vi.fn(),
}))
vi.mock('@/pages/saved/api/createCollection', () => ({
  createCollection: vi.fn(),
}))
vi.mock('@/pages/saved/api/updateCollection', () => ({
  updateCollection: vi.fn(),
}))
vi.mock('@/pages/saved/api/deleteCollection', () => ({
  deleteCollection: vi.fn(),
}))
vi.mock('@/pages/saved/api/removeSavedRestaurants', () => ({
  removeSavedRestaurants: vi.fn(),
}))
vi.mock('@/pages/saved/api/moveSavedRestaurants', () => ({
  moveSavedRestaurants: vi.fn(),
}))
vi.mock('@/pages/saved/api/saveRestaurant', () => ({ saveRestaurant: vi.fn() }))

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
  beforeEach(() => {
    vi.mocked(getCollection).mockResolvedValue({
      collectionId: 8,
      name: 'API 여행',
      color: 'yellow',
      description: '설명',
      visibility: 'private',
      owner: true,
      savedCount: 1,
    })
    vi.mocked(getCollections).mockResolvedValue({
      collections: [{ collectionId: 8, name: 'API 여행', savedCount: 1 }],
      totalCount: 1,
      hasNext: false,
    })
    vi.mocked(getSavedRestaurants).mockResolvedValue({
      content: [{ restaurantId: 55, name: '서버 식당', rating: 4.8 }],
      hasNext: false,
    })
  })

  it('컬렉션의 실제 서버 식당 ID로 상세 경로에 연결한다', async () => {
    setAccessToken('test-session')
    const { router } = await renderRoute('/saved/collections/8')
    const user = userEvent.setup()
    // 상세 페이지 구현 검증은 담당 feature 테스트에서 수행한다.
    vi.mocked(getRestaurantSummary).mockRejectedValue(new Error('offline'))
    await user.click(
      await screen.findByRole('button', { name: /서버 식당 4\.8/ }),
    )
    await act(async () => {
      await vi.dynamicImportSettled()
    })
    expect(router.state.location.pathname).toBe('/restaurants/55')
  })

  it('제품 목록에서 생성·수정·삭제 API를 호출하고 성공 후 갱신된 목록으로 복귀한다', async () => {
    setAccessToken('test-session')
    let detail = {
      collectionId: 42,
      name: '새 여행',
      color: 'red',
      description: '',
      visibility: 'public' as const,
      owner: true,
    }
    let exists = false
    vi.mocked(getCollections).mockImplementation(async () => ({
      collections: exists ? [detail] : [],
      totalCount: exists ? 1 : 0,
      hasNext: false,
    }))
    vi.mocked(getCollection).mockImplementation(async () => detail)
    vi.mocked(createCollection).mockImplementation(async () => {
      exists = true
      return detail
    })
    vi.mocked(updateCollection).mockImplementation(async (_id, body) => {
      detail = { ...detail, description: body.description ?? '' }
      return detail
    })
    vi.mocked(deleteCollection)
      .mockRejectedValueOnce(new Error('offline'))
      .mockImplementationOnce(async () => {
        exists = false
      })
    const { router } = await renderRoute('/saved')
    const user = userEvent.setup()
    await user.click(
      await screen.findByRole('button', { name: '새 컬렉션 만들기' }),
    )
    await user.type(await screen.findByLabelText('컬렉션명'), '새 여행')
    await user.click(screen.getByRole('radio', { name: '빨강' }))
    await user.click(screen.getByRole('button', { name: '만들기' }))
    expect(
      await screen.findByRole('button', { name: '새 여행 컬렉션 열기' }),
    ).toBeVisible()
    expect(router.state.location.pathname).toBe('/saved')
    expect(createCollection).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '새 여행 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '수정하기' }))
    await user.type(await screen.findByLabelText('설명'), '설명 수정')
    await user.click(screen.getByRole('button', { name: '저장하기' }))
    expect(
      await screen.findByRole('button', { name: '새 여행 컬렉션 열기' }),
    ).toBeVisible()
    expect(updateCollection).toHaveBeenCalledExactlyOnceWith(42, {
      description: '설명 수정',
    })
    await user.click(screen.getByRole('button', { name: '새 여행 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '삭제하기' }))
    await user.click(screen.getByRole('button', { name: '삭제하기' }))
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(
      screen.getByRole('button', { name: '새 여행 컬렉션 열기', hidden: true }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '삭제하기' }))
    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    )
    expect(await screen.findByText('총 0개')).toBeVisible()
    expect(deleteCollection).toHaveBeenLastCalledWith(42, expect.anything())
  })

  afterEach(() => {
    cleanup()
    document.body.style.overflow = ''
    clearAuthSession()
  })

  it.each([
    ['/saved', '저장 컬렉션', false],
    ['/saved/collections/8', 'API 여행', false],
    ['/saved/collections/new', '새 컬렉션 만들기', true],
    ['/saved/collections/8/edit', '컬렉션 수정', true],
    ['/saved/collections/8/restaurants/edit', '컬렉션 편집', true],
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
