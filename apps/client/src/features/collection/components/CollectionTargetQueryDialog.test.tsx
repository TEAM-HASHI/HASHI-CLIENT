import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import {
  createMemoryRouter,
  RouterProvider,
  useNavigate,
} from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CollectionTargetQueryDialog } from '@/features/collection/components/CollectionTargetQueryDialog'
import { getCollections } from '@/features/collection/api/getCollections'
import { getCollection } from '@/features/collection/api/getCollection'
import { getSavedRestaurants } from '@/features/collection/api/getSavedRestaurants'
import { saveRestaurant } from '@/features/collection/api/saveRestaurant'
import { moveSavedRestaurants } from '@/features/collection/api/moveSavedRestaurants'
import { ApiError } from '@/shared/api/apiError'
import { clearAuthSession, setAccessToken } from '@/shared/auth/authSession'

vi.mock('@/features/collection/api/getCollections', () => ({
  getCollections: vi.fn(),
}))
vi.mock('@/features/collection/api/getCollection', () => ({
  getCollection: vi.fn(),
}))
vi.mock('@/features/collection/api/getSavedRestaurants', () => ({
  getSavedRestaurants: vi.fn(),
}))
vi.mock('@/features/collection/api/saveRestaurant', () => ({
  saveRestaurant: vi.fn(),
}))
vi.mock('@/features/collection/api/moveSavedRestaurants', () => ({
  moveSavedRestaurants: vi.fn(),
}))
vi.mock('@/features/collection/api/removeSavedRestaurants', () => ({
  removeSavedRestaurants: vi.fn(),
}))
vi.mock('@/features/collection/api/deleteCollection', () => ({
  deleteCollection: vi.fn(),
}))
vi.mock('@/shared/lib/sentry', () => ({ captureError: vi.fn() }))

const clients: QueryClient[] = []
const observers = new Set<IntersectionObserverCallback>()
const roots: (Element | Document | null | undefined)[] = []
const ReturnFixture = () => {
  const navigate = useNavigate()
  return <button onClick={() => navigate(-1)}>생성 취소 후 복귀</button>
}
const setup = (mode: 'save' | 'move') => {
  const onClose = vi.fn()
  const onMoved = vi.fn()
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })
  clients.push(client)
  const Host = () => {
    const [open, setOpen] = useState(true)
    const close = () => {
      onClose()
      setOpen(false)
    }
    if (!open) return <p>닫힘</p>
    return mode === 'save' ? (
      <CollectionTargetQueryDialog
        mode="save"
        restaurantId={55}
        onClose={close}
      />
    ) : (
      <CollectionTargetQueryDialog
        mode="move"
        sourceCollectionId={8}
        restaurantIds={[55, 56]}
        onMoved={onMoved}
        onClose={close}
      />
    )
  }
  const router = createMemoryRouter(
    [
      { path: '/saved', element: <Host /> },
      { path: '/saved/collections/new', element: <ReturnFixture /> },
    ],
    { initialEntries: ['/saved'] },
  )
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { user: userEvent.setup(), onClose, onMoved, router, client }
}

beforeEach(() => {
  vi.resetAllMocks()
  setAccessToken('test-session')
  vi.mocked(getCollection).mockResolvedValue({ collectionId: 8, owner: true })
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
  clearAuthSession()
  observers.clear()
  roots.length = 0
  vi.unstubAllGlobals()
})

const intersect = async () => {
  await act(async () => {
    for (const callback of [...observers])
      callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
  })
}

describe('컬렉션 API 대상 선택·이동', () => {
  it('저장 여부를 서버에서 읽고 추가 페이지 대상을 선택해 실패 후 같은 대상으로 재시도한다', async () => {
    vi.mocked(getCollections)
      .mockResolvedValueOnce({
        collections: [{ collectionId: 8, name: '저장된 여행', saved: true }],
        totalCount: 2,
        hasNext: true,
        nextCursor: 8,
      })
      .mockResolvedValue({
        collections: [
          { collectionId: 9, name: '새 여행', saved: false, savedCount: 10 },
        ],
        totalCount: 2,
        hasNext: false,
      })
    let reject!: (error: Error) => void
    vi.mocked(saveRestaurant)
      .mockImplementationOnce(
        () =>
          new Promise((_, fail) => {
            reject = fail
          }),
      )
      .mockResolvedValueOnce({ collectionId: 9, savedCount: 11 })
    const { user, onClose } = setup('save')
    expect(
      await screen.findByRole('radio', { name: '저장된 여행 (저장됨)' }),
    ).toBeDisabled()
    await waitFor(() => expect(observers.size).toBeGreaterThan(0))
    expect(roots.at(-1)).toBe(
      screen.getByRole('radiogroup', { name: '컬렉션 저장 대상' })
        .parentElement,
    )
    await intersect()
    await user.click(await screen.findByRole('radio', { name: '새 여행' }))
    const confirm = screen.getByRole('button', { name: '저장' })
    fireEvent.click(confirm)
    fireEvent.click(confirm)
    await waitFor(() =>
      expect(saveRestaurant).toHaveBeenCalledExactlyOnceWith(9, {
        restaurantId: 55,
      }),
    )
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled()
    expect(onClose).not.toHaveBeenCalled()
    await act(async () => reject(new Error('offline')))
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(screen.getByRole('radio', { name: '새 여행' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await user.click(screen.getByRole('button', { name: '저장' }))
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(getCollections).toHaveBeenNthCalledWith(
      2,
      { restaurantId: 55, size: 20, cursor: 8 },
      expect.any(AbortSignal),
    )
  })

  it('대상의 뒤 페이지에 있는 중복을 제외하고 실제 이동 수와 보낸 ID를 일치시킨다', async () => {
    vi.mocked(getCollections).mockResolvedValue({
      collections: [
        { collectionId: 8, name: '원본' },
        { collectionId: 9, name: '대상' },
      ],
      totalCount: 2,
      hasNext: false,
    })
    vi.mocked(getSavedRestaurants).mockImplementation(async (_id, params) =>
      params?.cursor
        ? { content: [{ restaurantId: 56 }], hasNext: false }
        : {
            content: [{ restaurantId: 99 }],
            hasNext: true,
            nextCursor: 'next',
          },
    )
    vi.mocked(moveSavedRestaurants).mockResolvedValue({
      sourceCollection: { collectionId: 8, owner: true },
      targetCollection: { collectionId: 9 },
    })
    const { user, onMoved, onClose } = setup('move')
    await user.click(await screen.findByRole('radio', { name: '대상' }))
    expect(
      screen.queryByRole('radio', { name: '원본' }),
    ).not.toBeInTheDocument()
    expect(
      await screen.findByText('이미 저장된 1곳은 이동하지 않아요.'),
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: '이동 1' }))
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(getSavedRestaurants).toHaveBeenCalledWith(
      9,
      { sort: 'latest', size: 50, cursor: 'next' },
      expect.any(AbortSignal),
    )
    expect(moveSavedRestaurants).toHaveBeenCalledExactlyOnceWith(8, {
      targetCollectionId: 9,
      restaurantIds: [55],
    })
    expect(onMoved).toHaveBeenCalledExactlyOnceWith([55])
  })

  it('중복 확인 실패는 이동 가능으로 간주하지 않고 서버 409에도 선택과 확인창을 유지한다', async () => {
    vi.mocked(getCollections).mockResolvedValue({
      collections: [{ collectionId: 9, name: '대상' }],
      totalCount: 1,
      hasNext: false,
    })
    vi.mocked(getSavedRestaurants)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ content: [], hasNext: false })
    vi.mocked(moveSavedRestaurants).mockRejectedValue(
      new ApiError(
        {
          success: false,
          code: 'USER-012',
          message: 'conflict',
          data: null,
          path: '/api/v1/collections/8/restaurants/move',
          timestamp: '2026-10-20T03:00:00Z',
        },
        409,
      ),
    )
    const { user, onMoved, onClose } = setup('move')
    await user.click(await screen.findByRole('radio', { name: '대상' }))
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(screen.getByRole('button', { name: '이동' })).toBeDisabled()
    expect(moveSavedRestaurants).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    await user.click(await screen.findByRole('button', { name: '이동 2' }))
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(screen.getByRole('alert')).toHaveTextContent(
      '이미 컬렉션에 저장된 식당입니다',
    )
    expect(onClose).not.toHaveBeenCalled()
    expect(onMoved).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: '대상' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(moveSavedRestaurants).toHaveBeenCalledTimes(1)
  })

  it('저장 여부가 빠진 응답을 미저장으로 단정해 저장 요청을 보내지 않는다', async () => {
    vi.mocked(getCollections).mockResolvedValue({
      collections: [{ collectionId: 9, name: '대상' }],
      totalCount: 1,
      hasNext: false,
    })
    const { user } = setup('save')
    await user.click(await screen.findByRole('radio', { name: '대상' }))
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
    expect(saveRestaurant).not.toHaveBeenCalled()
  })

  it('대상 선택 후 생성 화면을 다녀와도 선택을 복원하고 자동 저장하지 않는다', async () => {
    vi.mocked(getCollections).mockResolvedValue({
      collections: [{ collectionId: 9, name: '대상', saved: false }],
      totalCount: 1,
      hasNext: false,
    })
    const { user, router } = setup('save')
    await user.click(await screen.findByRole('radio', { name: '대상' }))
    await user.click(screen.getByRole('button', { name: '새 컬렉션 만들기' }))
    expect(router.state.location.pathname).toBe('/saved/collections/new')
    await user.click(screen.getByRole('button', { name: '생성 취소 후 복귀' }))
    expect(await screen.findByRole('radio', { name: '대상' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(saveRestaurant).not.toHaveBeenCalled()
  })
})
