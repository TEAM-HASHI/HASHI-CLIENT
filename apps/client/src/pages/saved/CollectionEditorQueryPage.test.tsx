import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryRouter,
  RouterProvider,
  useNavigate,
} from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { CollectionEditorQueryPage } from '@/pages/saved/CollectionEditorQueryPage'
import { getCollection } from '@/pages/saved/api/getCollection'
import { getCollections } from '@/pages/saved/api/getCollections'
import { getSavedRestaurants } from '@/pages/saved/api/getSavedRestaurants'
import { removeSavedRestaurants } from '@/pages/saved/api/removeSavedRestaurants'
import { moveSavedRestaurants } from '@/pages/saved/api/moveSavedRestaurants'
import { clearAuthSession, setAccessToken } from '@/shared/auth/authSession'

vi.mock('@/pages/saved/api/getCollection', () => ({ getCollection: vi.fn() }))
vi.mock('@/pages/saved/api/getCollections', () => ({ getCollections: vi.fn() }))
vi.mock('@/pages/saved/api/getSavedRestaurants', () => ({
  getSavedRestaurants: vi.fn(),
}))
vi.mock('@/pages/saved/api/removeSavedRestaurants', () => ({
  removeSavedRestaurants: vi.fn(),
}))
vi.mock('@/pages/saved/api/moveSavedRestaurants', () => ({
  moveSavedRestaurants: vi.fn(),
}))
vi.mock('@/pages/saved/api/saveRestaurant', () => ({ saveRestaurant: vi.fn() }))
vi.mock('@/pages/saved/api/deleteCollection', () => ({
  deleteCollection: vi.fn(),
}))
vi.mock('@/shared/lib/sentry', () => ({ captureError: vi.fn() }))

const clients: QueryClient[] = []
const observers = new Set<IntersectionObserverCallback>()
const ReturnPage = () => {
  const navigate = useNavigate()
  return <button onClick={() => navigate(-1)}>생성에서 복귀</button>
}
const setup = () => {
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
      { path: '/saved/collections/new', element: <ReturnPage /> },
      { path: '/saved/collections/:collectionId', element: <p>상세 복귀</p> },
      { path: '/saved', element: <p>목록</p> },
    ],
    {
      initialEntries: [
        '/saved/collections/8/restaurants/edit?sort=rating&category=cafe',
      ],
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
  await user.click(screen.getByRole('button', { name: '생성에서 복귀' }))
  expect(await screen.findByRole('radio', { name: '대상' })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  expect(
    screen.getByRole('checkbox', { name: '라떼 선택', hidden: true }),
  ).toBeChecked()
  await user.click(await screen.findByRole('button', { name: '이동 1' }))
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
  expect(router.state.location.pathname).toBe('/saved/collections/8')
  expect(router.state.location.search).toBe('?sort=rating&category=cafe')
})

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
