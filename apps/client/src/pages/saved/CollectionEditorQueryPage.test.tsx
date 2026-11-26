import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { CollectionEditorQueryPage } from '@/pages/saved/CollectionEditorQueryPage'
import { CollectionFormQueryPage } from '@/pages/saved/CollectionFormQueryPage'
import { createCollection } from '@/features/collection/api/createCollection'
import { getCollection } from '@/features/collection/api/getCollection'
import { getCollections } from '@/features/collection/api/getCollections'
import { getSavedRestaurants } from '@/features/collection/api/getSavedRestaurants'
import { removeSavedRestaurants } from '@/features/collection/api/removeSavedRestaurants'
import { moveSavedRestaurants } from '@/features/collection/api/moveSavedRestaurants'
import {
  clearAuthSession,
  setAccessToken,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

vi.mock('@/features/collection/api/getCollection', () => ({
  getCollection: vi.fn(),
}))
vi.mock('@/features/collection/api/getCollections', () => ({
  getCollections: vi.fn(),
}))
vi.mock('@/features/collection/api/createCollection', () => ({
  createCollection: vi.fn(),
}))
vi.mock('@/features/collection/api/getSavedRestaurants', () => ({
  getSavedRestaurants: vi.fn(),
}))
vi.mock('@/features/collection/api/removeSavedRestaurants', () => ({
  removeSavedRestaurants: vi.fn(),
}))
vi.mock('@/features/collection/api/moveSavedRestaurants', () => ({
  moveSavedRestaurants: vi.fn(),
}))
vi.mock('@/features/collection/api/saveRestaurant', () => ({
  saveRestaurant: vi.fn(),
}))
vi.mock('@/features/collection/api/deleteCollection', () => ({
  deleteCollection: vi.fn(),
}))
vi.mock('@/shared/lib/sentry', () => ({ captureError: vi.fn() }))

const clients: QueryClient[] = []
const observers = new Set<IntersectionObserverCallback>()
const detailPath = '/saved/collections/8?sort=rating&category=cafe'
const editorPath =
  '/saved/collections/8/restaurants/edit?sort=rating&category=cafe'
const setup = (fromDetail = false) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  clients.push(client)
  const router = createMemoryRouter(
    [
      {
        path: '/saved/collections/:collectionId/restaurants/edit',
        element: <CollectionEditorQueryPage />,
      },
      { path: '/saved/collections/new', element: <CollectionFormQueryPage /> },
      { path: '/saved/collections/:collectionId', element: <p>상세 복귀</p> },
      { path: '/saved', element: <p>목록</p> },
      { path: '/map', element: <p>지도</p> },
    ],
    {
      initialEntries: fromDetail
        ? [
            '/saved',
            {
              pathname: '/saved/collections/8',
              search: '?sort=rating&category=cafe',
              key: 'detail-key',
            },
            {
              pathname: '/saved/collections/8/restaurants/edit',
              search: '?sort=rating&category=cafe',
              state: { collectionEditorReturnKey: 'detail-key' },
            },
          ]
        : ['/map', editorPath],
    },
  )
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { user: userEvent.setup(), router }
}
beforeEach(() => {
  vi.resetAllMocks()
  setAccessToken('test-session')
  vi.mocked(getCollection).mockResolvedValue({
    collectionId: 8,
    name: '여행',
    owner: true,
  })
  vi.mocked(getCollections).mockResolvedValue({
    collections: [{ collectionId: 9, name: '대상' }],
    totalCount: 1,
    hasNext: false,
  })
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(private callback: IntersectionObserverCallback) {}
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
  clearAuthSession()
  vi.unstubAllGlobals()
})

it('계정 변경 시 같은 식당 ID라도 이전 선택을 복원하지 않는다', async () => {
  startAuthenticatedSession('account-a', 1)
  vi.mocked(getSavedRestaurants).mockResolvedValue({
    content: [{ restaurantId: 55, name: '커피' }],
    hasNext: false,
  })
  const { user } = setup()
  await user.click(await screen.findByRole('checkbox', { name: '커피 선택' }))
  expect(screen.getByRole('button', { name: '삭제 1' })).toBeEnabled()
  act(() => startAuthenticatedSession('account-b', 2))
  expect(
    await screen.findByRole('checkbox', { name: '커피 선택' }),
  ).not.toBeChecked()
  expect(screen.getByRole('button', { name: '삭제' })).toBeDisabled()
})

it('추가 조회 실패와 삭제 실패에도 기존 선택을 유지하고 성공한 ID만 해제한다', async () => {
  vi.mocked(getSavedRestaurants)
    .mockResolvedValueOnce({
      content: [{ restaurantId: 55, name: '커피' }],
      hasNext: true,
      nextCursor: 'next',
    })
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue({
      content: [{ restaurantId: 56, name: '라떼' }],
      hasNext: false,
    })
  vi.mocked(removeSavedRestaurants)
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ collectionId: 8, owner: true })
  const { user } = setup()
  await user.click(await screen.findByRole('checkbox', { name: '커피 선택' }))
  await waitFor(() => expect(observers.size).toBeGreaterThan(0))
  await act(async () => {
    for (const cb of [...observers])
      cb(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
  })
  expect(await screen.findByRole('alert')).toBeVisible()
  expect(
    screen.getByRole('checkbox', { name: '커피 선택', hidden: true }),
  ).toBeChecked()
  await user.click(screen.getByRole('button', { name: '다시 시도' }))
  await user.click(await screen.findByRole('checkbox', { name: '라떼 선택' }))
  expect(screen.getByRole('checkbox', { name: '전체 선택' })).toBeChecked()
  await user.click(screen.getByRole('button', { name: '삭제 2' }))
  await user.click(screen.getByRole('button', { name: '삭제하기' }))
  expect(await screen.findByRole('alert')).toBeVisible()
  expect(
    screen.getByRole('checkbox', { name: '커피 선택', hidden: true }),
  ).toBeChecked()
  await user.click(screen.getByRole('button', { name: '삭제하기' }))
  await waitFor(() =>
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
  )
  expect(removeSavedRestaurants).toHaveBeenLastCalledWith(8, [55, 56])
  expect(screen.getByRole('button', { name: '삭제' })).toBeDisabled()
})

it('대상 생성에서 돌아오면 선택과 이동창을 복원하고 중복으로 남은 식당 선택을 보존한다', async () => {
  const targets = [{ collectionId: 9, name: '대상' }]
  vi.mocked(getCollections).mockImplementation(async () => ({
    collections: [...targets],
    totalCount: targets.length,
    hasNext: false,
  }))
  vi.mocked(createCollection).mockImplementation(async ({ name }) => {
    const created = { collectionId: 10, name }
    targets.unshift(created)
    return created
  })
  vi.mocked(getSavedRestaurants).mockImplementation(async (id) => ({
    content:
      id === 9
        ? [{ restaurantId: 56 }]
        : [
            { restaurantId: 55, name: '커피' },
            { restaurantId: 56, name: '라떼' },
          ],
    hasNext: false,
  }))
  vi.mocked(moveSavedRestaurants).mockResolvedValue({
    sourceCollection: { collectionId: 8, owner: true },
    targetCollection: { collectionId: 9 },
  })
  const { user, router } = setup()
  await user.click(await screen.findByRole('checkbox', { name: '커피 선택' }))
  await user.click(screen.getByRole('checkbox', { name: '라떼 선택' }))
  await user.click(screen.getByRole('button', { name: '이동 2' }))
  await user.click(await screen.findByRole('radio', { name: '대상' }))
  await user.click(screen.getByRole('button', { name: '새 컬렉션 만들기' }))
  await user.type(screen.getByLabelText('컬렉션명'), '새 대상')
  const create = screen.getByRole('button', { name: '만들기' })
  await waitFor(() => expect(create).toBeEnabled())
  await user.click(create)
  expect(await screen.findByRole('radio', { name: '새 대상' })).toHaveAttribute(
    'aria-checked',
    'false',
  )
  expect(router.state.location.pathname + router.state.location.search).toBe(
    editorPath,
  )
  expect(await screen.findByRole('radio', { name: '대상' })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  expect(
    screen.getByRole('checkbox', { name: '라떼 선택', hidden: true }),
  ).toBeChecked()
  expect(moveSavedRestaurants).not.toHaveBeenCalled()
  await user.click(await screen.findByRole('button', { name: '이동' }))
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  )
  expect(
    screen.getByRole('checkbox', { name: '라떼 선택', hidden: true }),
  ).toBeChecked()
  expect(screen.getByRole('checkbox', { name: '커피 선택' })).not.toBeChecked()
  expect(moveSavedRestaurants).toHaveBeenCalledExactlyOnceWith(8, {
    targetCollectionId: 9,
    restaurantIds: [55],
  })
  await user.click(screen.getByRole('button', { name: '편집 종료' }))
  expect(router.state.location.pathname + router.state.location.search).toBe(
    detailPath,
  )
})

it.each(['header', 'browser'])(
  '대상 생성을 취소한 뒤 %s로 편집을 종료하면 앞으로가기로 선택을 복원하지 않는다',
  async (source) => {
    vi.mocked(getSavedRestaurants).mockResolvedValue({
      content: [{ restaurantId: 55, name: '커피' }],
      hasNext: false,
    })
    const { user, router } = setup(true)
    await user.click(await screen.findByRole('checkbox', { name: '커피 선택' }))
    await user.click(screen.getByRole('button', { name: '이동 1' }))
    await user.click(await screen.findByRole('radio', { name: '대상' }))
    await user.click(screen.getByRole('button', { name: '새 컬렉션 만들기' }))
    await user.click(screen.getByRole('button', { name: '뒤로가기' }))
    const dialog = await screen.findByRole('dialog', { name: '컬렉션 이동' })
    expect(
      await within(dialog).findByText('이미 저장된 식당이에요.'),
    ).toBeVisible()
    expect(within(dialog).getByRole('button', { name: '이동' })).toBeDisabled()
    expect(
      screen.getByRole('checkbox', { name: '커피 선택', hidden: true }),
    ).toBeChecked()
    expect(moveSavedRestaurants).not.toHaveBeenCalled()
    expect(createCollection).not.toHaveBeenCalled()

    if (source === 'header') {
      await user.click(within(dialog).getByRole('button', { name: '취소' }))
      expect(screen.getByRole('checkbox', { name: '커피 선택' })).toBeChecked()
      await user.click(screen.getByRole('button', { name: '편집 종료' }))
    } else {
      await act(async () => {
        await router.navigate(-1)
      })
    }
    expect(router.state.location.key).toBe('detail-key')
    expect(router.state.location.pathname + router.state.location.search).toBe(
      detailPath,
    )
    await act(async () => {
      await router.navigate(-1)
    })
    expect(router.state.location.pathname).toBe('/saved')
    await act(async () => {
      await router.navigate(2)
    })
    expect(router.state.location.pathname + router.state.location.search).toBe(
      editorPath,
    )
    expect(
      await screen.findByRole('checkbox', { name: '커피 선택' }),
    ).not.toBeChecked()
    expect(screen.getByRole('button', { name: '이동' })).toBeDisabled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  },
)

it('타인 소유 컬렉션은 편집 목록과 쓰기 액션을 노출하지 않는다', async () => {
  vi.mocked(getCollection).mockResolvedValue({ collectionId: 8, owner: false })
  const { user } = setup()
  expect(await screen.findByRole('alert')).toBeVisible()
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  expect(getSavedRestaurants).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: '편집 종료' }))
  expect(await screen.findByText('상세 복귀')).toBeVisible()
})

it('전체 선택은 불러온 목록만 선택하고 추가 페이지는 자동 선택하지 않는다', async () => {
  vi.mocked(getSavedRestaurants)
    .mockResolvedValueOnce({
      content: [{ restaurantId: 55, name: '커피' }],
      hasNext: true,
      nextCursor: 'next',
    })
    .mockResolvedValueOnce({
      content: [{ restaurantId: 56, name: '라떼' }],
      hasNext: false,
    })
  const { user } = setup()
  await screen.findByRole('checkbox', { name: '커피 선택' })
  const all = screen.getByRole('checkbox', { name: '전체 선택' })
  await user.click(all)
  expect(screen.getByRole('checkbox', { name: '커피 선택' })).toBeChecked()
  expect(screen.getByRole('button', { name: '삭제 1' })).toBeEnabled()
  expect(getSavedRestaurants).toHaveBeenCalledTimes(1)
  await waitFor(() => expect(observers.size).toBeGreaterThan(0))
  await act(async () => {
    for (const cb of [...observers])
      cb(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
  })
  expect(
    await screen.findByRole('checkbox', { name: '라떼 선택' }),
  ).not.toBeChecked()
  expect(all).toBePartiallyChecked()
  expect(screen.getByRole('button', { name: '삭제 1' })).toBeEnabled()
  await user.click(all)
  expect(screen.getByRole('checkbox', { name: '라떼 선택' })).toBeChecked()
  expect(all).toBeChecked()
  expect(screen.getByRole('button', { name: '삭제 2' })).toBeEnabled()
  await user.click(all)
  expect(screen.getByRole('checkbox', { name: '커피 선택' })).not.toBeChecked()
  expect(screen.getByRole('checkbox', { name: '라떼 선택' })).not.toBeChecked()
  expect(screen.getByRole('button', { name: '삭제' })).toBeDisabled()
})
