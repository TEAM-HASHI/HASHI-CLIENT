import { showToast } from '@hashi/hds-ui'
import { copyUrlToClipboard } from '@/shared/utils/clipboard'
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

import { appRoutes } from '@/app/router/routes'
import { getRestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import type { PropsWithChildren } from 'react'
import { clearAuthSession, setAccessToken } from '@/shared/auth/authSession'
import { createQueryClient } from '@/shared/lib/queryClient'

vi.mock('@/shared/utils/clipboard', () => ({ copyUrlToClipboard: vi.fn() }))
vi.mock('@hashi/hds-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@hashi/hds-ui')>()),
  showToast: vi.fn(),
}))

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
    vi.mocked(updateCollection).mockReset()
    vi.mocked(copyUrlToClipboard).mockReset().mockResolvedValue(true)
    vi.mocked(showToast).mockClear()
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
      collections: [
        {
          collectionId: 8,
          name: 'API 여행',
          savedCount: 1,
          visibility: 'private',
        },
      ],
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

  it('비로그인 공개 상세는 열고 내 목록·쓰기 화면은 인증으로 보호한다', async () => {
    clearAuthSession()
    vi.mocked(getCollection).mockResolvedValue({
      collectionId: 8,
      name: '공개 여행',
      visibility: 'public',
      owner: false,
    })
    const { router } = await renderRoute('/saved/collections/8')
    expect(
      await screen.findByRole('heading', { name: '공개 여행' }),
    ).toBeVisible()
    expect(getCollections).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('button', { name: '컬렉션 더보기' }),
    ).not.toBeInTheDocument()
    await act(async () => {
      await router.navigate('/saved/collections/8/edit')
    })
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/login-required'),
    )
    await act(async () => {
      await router.navigate('/saved')
    })
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/login-required'),
    )
  })

  it('공개 컬렉션은 상세 주소만 복사하고 공개 전환 요청 없이 성공을 안내한다', async () => {
    setAccessToken('test-session')
    vi.mocked(getCollection).mockResolvedValue({
      collectionId: 8,
      name: '공개 여행',
      visibility: 'public',
      owner: true,
    })
    const previousCalls = vi.mocked(updateCollection).mock.calls.length
    const { router } = await renderRoute(
      '/saved/collections/8?sort=rating&category=cafe',
    )
    const user = userEvent.setup()
    expect(
      screen.queryByRole('button', { name: '컬렉션 공유' }),
    ).not.toBeInTheDocument()
    await user.click(
      await screen.findByRole('button', { name: '컬렉션 더보기' }),
    )
    expect(
      screen.getAllByRole('menuitem').map((item) => item.textContent),
    ).toEqual(['편집하기', '공유하기', '삭제하기'])
    await user.click(screen.getByRole('menuitem', { name: '공유하기' }))
    await waitFor(() =>
      expect(copyUrlToClipboard).toHaveBeenCalledWith('/saved/collections/8'),
    )
    expect(updateCollection).toHaveBeenCalledTimes(previousCalls)
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ children: '컬렉션 링크가 복사되었어요.' }),
    )
    expect(router.state.location.search).toBe('?sort=rating&category=cafe')
  })

  it('복사 대기 중 중복 요청을 막고 화면 이탈 후에는 토스트를 띄우지 않는다', async () => {
    setAccessToken('test-session')
    vi.mocked(getCollection).mockResolvedValue({
      collectionId: 8,
      name: '공개 여행',
      visibility: 'public',
      owner: true,
    })
    let finish!: (copied: boolean) => void
    vi.mocked(copyUrlToClipboard).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    const { router } = await renderRoute('/saved/collections/8')
    const user = userEvent.setup()
    await user.click(
      await screen.findByRole('button', { name: '컬렉션 더보기' }),
    )
    await user.click(screen.getByRole('menuitem', { name: '공유하기' }))
    await user.click(screen.getByRole('button', { name: '컬렉션 더보기' }))
    await user.click(screen.getByRole('menuitem', { name: '공유하기' }))
    expect(copyUrlToClipboard).toHaveBeenCalledTimes(1)
    await act(async () => {
      await router.navigate('/saved')
    })
    await act(async () => {
      finish(true)
    })
    expect(showToast).not.toHaveBeenCalled()
  })

  it('비공개 공유는 취소·전환 실패를 보존하고 복사만 실패하면 공개를 유지한다', async () => {
    setAccessToken('test-session')
    let detail = {
      collectionId: 8,
      name: 'API 여행',
      visibility: 'private',
      owner: true,
    }
    vi.mocked(getCollection).mockImplementation(async () => detail)
    vi.mocked(getCollections).mockImplementation(async () => ({
      collections: [detail],
      totalCount: 1,
      hasNext: false,
    }))
    vi.mocked(updateCollection)
      .mockReset()
      .mockRejectedValueOnce(new Error('offline'))
      .mockImplementation(async () => {
        detail = { ...detail, visibility: 'public' }
        return detail
      })
    vi.mocked(copyUrlToClipboard).mockResolvedValue(false)
    const { router } = await renderRoute('/saved')
    const user = userEvent.setup()
    const openShare = async () => {
      await user.click(
        await screen.findByRole('button', { name: 'API 여행 더보기' }),
      )
      expect(
        screen.getAllByRole('menuitem').map((item) => item.textContent),
      ).toEqual(['수정하기', '공유하기', '삭제하기'])
      await user.click(screen.getByRole('menuitem', { name: '공유하기' }))
    }
    await openShare()
    await user.click(await screen.findByRole('button', { name: '취소하기' }))
    expect(updateCollection).not.toHaveBeenCalled()
    expect(copyUrlToClipboard).not.toHaveBeenCalled()
    await openShare()
    await user.click(
      await screen.findByRole('button', { name: '공개 후 공유' }),
    )
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(detail.visibility).toBe('private')
    expect(copyUrlToClipboard).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '공개 후 공유' }))
    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    )
    expect(detail.visibility).toBe('public')
    expect(updateCollection).toHaveBeenLastCalledWith(8, {
      visibility: 'public',
    })
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        children: '링크를 복사하지 못했습니다. 다시 시도해주세요.',
      }),
    )
    expect(router.state.location.pathname).toBe('/saved')
    await openShare()
    await waitFor(() => expect(copyUrlToClipboard).toHaveBeenCalledTimes(2))
    expect(updateCollection).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
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
})
