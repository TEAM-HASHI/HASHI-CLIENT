import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getCollection } from '@/pages/saved/api/getCollection'
import { getCollections } from '@/pages/saved/api/getCollections'
import { getSavedRestaurants } from '@/pages/saved/api/getSavedRestaurants'
import { SavedQueryPage } from '@/pages/saved/SavedQueryPage'
import { clearAuthSession, setAccessToken } from '@/shared/auth/authSession'

vi.mock('@/pages/saved/api/getCollection', () => ({ getCollection: vi.fn() }))
vi.mock('@/pages/saved/api/getCollections', () => ({ getCollections: vi.fn() }))
vi.mock('@/pages/saved/api/getSavedRestaurants', () => ({
  getSavedRestaurants: vi.fn(),
}))

const observers = new Set<IntersectionObserverCallback>()
const roots: (Element | Document | null | undefined)[] = []
const clients: QueryClient[] = []
const setup = (
  path = '/saved',
  props: ComponentProps<typeof SavedQueryPage> = {},
) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  clients.push(client)
  const router = createMemoryRouter(
    [
      { path: '/saved', element: <SavedQueryPage {...props} /> },
      {
        path: '/saved/collections/:collectionId',
        element: <SavedQueryPage {...props} />,
      },
      { path: '/restaurants/:restaurantId', element: <div>식당 상세</div> },
    ],
    { initialEntries: [path] },
  )
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { router, user: userEvent.setup(), client }
}

beforeEach(() => {
  vi.resetAllMocks()
  setAccessToken('test-session')
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(
        private callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit,
      ) {
        roots.push(options?.root)
      }
      observe() {
        observers.add(this.callback)
      }
      disconnect() {
        observers.delete(this.callback)
      }
    },
  )
})
afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
  observers.clear()
  roots.length = 0
  clearAuthSession()
  vi.unstubAllGlobals()
})

const intersect = async () => {
  await act(async () => {
    for (const callback of [...observers]) {
      callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    }
  })
}

describe('컬렉션 서버 조회 화면', () => {
  it('서버 전체 개수를 표시하고 추가 조회 실패에도 기존 목록을 보존해 재시도한다', async () => {
    vi.mocked(getCollections)
      .mockResolvedValueOnce({
        collections: [{ collectionId: 8, name: '여행', savedCount: 23 }],
        totalCount: 42,
        hasNext: true,
        nextCursor: 8,
      })
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({
        collections: [{ collectionId: 7, name: '카페' }],
        totalCount: 42,
        hasNext: false,
      })
    const { user } = setup()
    expect(await screen.findByText('총 42개')).toBeVisible()
    expect(screen.getByText('23')).toBeVisible()
    await waitFor(() => expect(observers.size).toBeGreaterThan(0))
    expect(roots.at(-1)).toBe(
      screen.getByRole('region', { name: '컬렉션 목록' }),
    )
    await intersect()
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(
      screen.getByRole('button', { name: '여행 컬렉션 열기' }),
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(
      await screen.findByRole('button', { name: '카페 컬렉션 열기' }),
    ).toBeVisible()
    expect(getCollections).toHaveBeenLastCalledWith(
      { size: 20, cursor: 8 },
      expect.any(AbortSignal),
    )
    expect(screen.getByText('총 42개')).toBeVisible()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('초기 실패를 빈 목록으로 바꾸지 않고 재시도 후 실제 빈 목록을 표시한다', async () => {
    vi.mocked(getCollections)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ collections: [], totalCount: 0, hasNext: false })
    const { user } = setup()
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(screen.queryByText('총 0개')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(await screen.findByText('총 0개')).toBeVisible()
    expect(
      screen.getByRole('list', { name: '저장 컬렉션' }).children,
    ).toHaveLength(0)
  })

  it('상세 직접 진입 중 목록으로 보내지 않고 서버 ID·정렬·분류를 사용한다', async () => {
    let finish!: (value: Awaited<ReturnType<typeof getCollection>>) => void
    vi.mocked(getCollection).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    vi.mocked(getSavedRestaurants).mockResolvedValue({
      content: [{ restaurantId: 55, name: '스시', rating: 4.8 }],
      hasNext: false,
    })
    const actions = vi.fn(() => <button>편집하기</button>)
    const { router, user } = setup(
      '/saved/collections/8?sort=reviews&category=cafe',
      { renderDetailActions: actions, renderRestaurantActions: actions },
    )
    expect(screen.getByRole('status')).toBeVisible()
    expect(router.state.location.pathname).toBe('/saved/collections/8')
    await act(async () =>
      finish({ collectionId: 8, name: '여행', savedCount: 100, owner: false }),
    )
    expect(await screen.findByRole('heading', { name: '여행' })).toBeVisible()
    expect(getSavedRestaurants).toHaveBeenCalledWith(
      8,
      { sort: 'review', placeType: 'cafe', size: 20 },
      expect.any(AbortSignal),
    )
    expect(screen.queryByText('총 1곳')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '컬렉션 더보기' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /스시 4.8/ }))
    expect(router.state.location.pathname).toContain('/55')
    expect(getCollections).not.toHaveBeenCalled()
    expect(actions).not.toHaveBeenCalled()
  })

  it('분류 변경 시 이전 식당을 새 필터 결과로 표시하지 않는다', async () => {
    vi.mocked(getCollection).mockResolvedValue({
      collectionId: 8,
      name: '여행',
      savedCount: 100,
    })
    vi.mocked(getSavedRestaurants)
      .mockResolvedValueOnce({
        content: [{ restaurantId: 55, name: '스시' }],
        hasNext: false,
      })
      .mockResolvedValueOnce({
        content: [{ restaurantId: 56, name: '라떼' }],
        hasNext: false,
      })
    const { user, router } = setup('/saved/collections/8')
    expect(await screen.findByRole('button', { name: '스시' })).toBeVisible()
    expect(screen.getByText('총 100곳')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '분류 선택' }))
    await user.click(screen.getByRole('menuitemradio', { name: '카페' }))
    expect(await screen.findByRole('button', { name: '라떼' })).toBeVisible()
    expect(
      screen.queryByRole('button', { name: '스시' }),
    ).not.toBeInTheDocument()
    expect(router.state.location.search).toContain('category=cafe')
    expect(getSavedRestaurants).toHaveBeenLastCalledWith(
      8,
      { sort: 'latest', placeType: 'cafe', size: 20 },
      expect.any(AbortSignal),
    )
  })

  it('식당 상세에서 돌아오면 추가 페이지·정렬·분류와 내부 스크롤을 복원한다', async () => {
    vi.mocked(getCollection).mockResolvedValue({
      collectionId: 8,
      name: '여행',
      savedCount: 100,
    })
    vi.mocked(getSavedRestaurants).mockImplementation(async (_id, params) =>
      params?.cursor
        ? { content: [{ restaurantId: 56, name: '라떼' }], hasNext: false }
        : {
            content: [{ restaurantId: 55, name: '커피' }],
            hasNext: true,
            nextCursor: 'next',
          },
    )
    const { user, router } = setup(
      '/saved/collections/8?sort=rating&category=cafe',
    )
    expect(await screen.findByRole('button', { name: '커피' })).toBeVisible()
    await waitFor(() => expect(observers.size).toBeGreaterThan(0))
    await intersect()
    expect(await screen.findByRole('button', { name: '라떼' })).toBeVisible()
    screen.getByRole('region', { name: '저장 식당 목록' }).scrollTop = 312
    await user.click(screen.getByRole('button', { name: '라떼' }))
    expect(await screen.findByText('식당 상세')).toBeVisible()
    await act(async () => {
      await router.navigate(-1)
    })
    expect(await screen.findByRole('button', { name: '라떼' })).toBeVisible()
    expect(
      screen.getByRole('region', { name: '저장 식당 목록' }).scrollTop,
    ).toBe(312)
    expect(router.state.location.search).toBe('?sort=rating&category=cafe')
  })

  it('인증 준비 전에는 보호 API를 요청하지 않는다', () => {
    clearAuthSession()
    setup('/saved/collections/8')
    expect(getCollection).not.toHaveBeenCalled()
    expect(getCollections).not.toHaveBeenCalled()
    expect(getSavedRestaurants).not.toHaveBeenCalled()
  })
})
