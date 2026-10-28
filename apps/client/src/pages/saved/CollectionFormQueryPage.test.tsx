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
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CollectionFormQueryPage } from '@/pages/saved/CollectionFormQueryPage'
import { createCollection } from '@/features/collection/api/createCollection'
import { updateCollection } from '@/features/collection/api/updateCollection'
import { getCollection } from '@/features/collection/api/getCollection'
import { getCollections } from '@/features/collection/api/getCollections'
import { collectionQueryKeys } from '@/features/collection/queries/collectionQueryKeys'
import { ApiError } from '@/shared/api/apiError'
import { captureError } from '@/shared/lib/sentry'
import {
  clearAuthSession,
  setAccessToken,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

vi.mock('@/features/collection/api/createCollection', () => ({
  createCollection: vi.fn(),
}))
vi.mock('@/features/collection/api/updateCollection', () => ({
  updateCollection: vi.fn(),
}))
vi.mock('@/features/collection/api/getCollection', () => ({
  getCollection: vi.fn(),
}))
vi.mock('@/features/collection/api/getCollections', () => ({
  getCollections: vi.fn(),
}))
vi.mock('@/shared/lib/sentry', () => ({ captureError: vi.fn() }))

const detail = {
  collectionId: 8,
  name: '여행',
  color: 'red',
  description: '설명',
  visibility: 'private',
  owner: true,
}
const clients: QueryClient[] = []
const Returned = () => {
  const location = useLocation()
  return <div>원래 화면 {JSON.stringify(location.state)}</div>
}
const setup = (editing = false) => {
  const onError = vi.fn()
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, onError },
    },
  })
  clients.push(client)
  const router = createMemoryRouter(
    [
      { path: '/saved', element: <Returned /> },
      { path: '/saved/collections/new', element: <CollectionFormQueryPage /> },
      {
        path: '/saved/collections/:collectionId/edit',
        element: <CollectionFormQueryPage />,
      },
    ],
    {
      initialEntries: [
        {
          pathname: '/saved',
          state: {
            collectionSaveRestaurantId: '55',
            collectionSaveSelectedId: '7',
          },
          key: 'return-key',
        },
        {
          pathname: editing
            ? '/saved/collections/8/edit'
            : '/saved/collections/new',
          state: {
            collectionReturn: {
              pathname: '/saved',
              search: '',
              state: {
                collectionSaveRestaurantId: '55',
                collectionSaveSelectedId: '7',
              },
              key: 'return-key',
            },
          },
        },
      ],
    },
  )
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { user: userEvent.setup(), client, router, onError }
}

beforeEach(() => {
  vi.resetAllMocks()
  setAccessToken('test-session')
  vi.mocked(getCollections).mockResolvedValue({
    collections: [],
    totalCount: 0,
    hasNext: false,
    nextCursor: undefined,
  })
})
afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
  clearAuthSession()
})

describe('컬렉션 API 폼 연결', () => {
  it.each(['조회 중', '조회 실패'] as const)(
    '이름 목록 %s에도 기존 이름의 색상 수정은 저장하고 이름 변경은 확인을 기다린다',
    async (state) => {
      vi.mocked(getCollection).mockResolvedValue(detail)
      vi.mocked(updateCollection).mockResolvedValue({
        ...detail,
        color: 'yellow',
      })
      if (state === '조회 중')
        vi.mocked(getCollections).mockReturnValue(new Promise(() => {}))
      else vi.mocked(getCollections).mockRejectedValue(new Error('network'))
      const { user } = setup(true)
      await screen.findByDisplayValue('여행')
      if (state === '조회 실패')
        await waitFor(() => expect(getCollections).toHaveBeenCalled())
      await user.click(screen.getByRole('radio', { name: '노랑' }))
      expect(screen.getByRole('button', { name: '저장하기' })).toBeEnabled()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      await user.type(screen.getByLabelText('컬렉션명'), ' 수정')
      expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled()
      if (state === '조회 실패')
        expect(await screen.findByRole('alert')).toBeVisible()
      await user.clear(screen.getByLabelText('컬렉션명'))
      await user.type(screen.getByLabelText('컬렉션명'), '  여행  ')
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: '저장하기' }))
      await waitFor(() =>
        expect(updateCollection).toHaveBeenCalledExactlyOnceWith(8, {
          color: 'yellow',
        }),
      )
    },
  )

  it('수정 중인 컬렉션 자신의 이름은 중복으로 막지 않는다', async () => {
    vi.mocked(getCollection).mockResolvedValue(detail)
    vi.mocked(getCollections).mockResolvedValue({
      collections: [detail],
      totalCount: 1,
      hasNext: false,
    })
    const { user } = setup(true)
    await screen.findByDisplayValue('여행')
    await user.click(screen.getByRole('radio', { name: '노랑' }))
    expect(screen.queryByText('중복된 컬렉션명입니다.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장하기' })).toBeEnabled()
  })

  it('다음 페이지의 이름도 입력 중 중복 안내하고 서버 생성 요청을 막는다', async () => {
    vi.mocked(getCollections)
      .mockResolvedValueOnce({
        collections: [{ collectionId: 7, name: '다른 이름' }],
        totalCount: 2,
        hasNext: true,
        nextCursor: 7,
      })
      .mockResolvedValueOnce({
        collections: [{ collectionId: 8, name: '여행' }],
        totalCount: 2,
        hasNext: false,
        nextCursor: undefined,
      })
    const { user } = setup()
    await user.type(screen.getByLabelText('컬렉션명'), '  여행  ')
    await user.click(screen.getByRole('radio', { name: '빨강' }))
    expect(await screen.findByText('중복된 컬렉션명입니다.')).toBeVisible()
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()
    expect(getCollections).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: 7 }),
      expect.any(AbortSignal),
    )
    expect(createCollection).not.toHaveBeenCalled()
    await user.clear(screen.getByLabelText('컬렉션명'))
    await user.type(screen.getByLabelText('컬렉션명'), '새 이름')
    expect(screen.queryByText('중복된 컬렉션명입니다.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '만들기' })).toBeEnabled()
  })

  it('이름 목록 확인 중과 실패 시 제출을 막고 재조회 후 입력을 유지한다', async () => {
    let reject!: (error: Error) => void
    vi.mocked(getCollections).mockReturnValueOnce(
      new Promise((_, fail) => {
        reject = fail
      }),
    )
    const { user } = setup()
    await user.type(screen.getByLabelText('컬렉션명'), '새 이름')
    await user.click(screen.getByRole('radio', { name: '빨강' }))
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()
    await act(async () => reject(new Error('network')))
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '만들기' })).toBeEnabled(),
    )
    expect(screen.getByLabelText('컬렉션명')).toHaveValue('새 이름')
  })

  it('계정 변경 시 입력을 비우고 이전 생성 응답으로 복귀하지 않는다', async () => {
    startAuthenticatedSession('account-a', 1)
    let finish!: (value: typeof detail) => void
    vi.mocked(createCollection).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    const { user, router, onError } = setup()
    await user.type(screen.getByLabelText('컬렉션명'), 'A 초안')
    await user.click(screen.getByRole('radio', { name: '빨강' }))
    await user.click(screen.getByRole('button', { name: '만들기' }))
    act(() => startAuthenticatedSession('account-b', 2))
    expect(screen.getByLabelText('컬렉션명')).toHaveValue('')
    await act(async () => finish(detail))
    expect(router.state.location.pathname).toBe('/saved/collections/new')
    expect(screen.getByLabelText('컬렉션명')).toHaveValue('')
    expect(onError).not.toHaveBeenCalled()
    expect(captureError).not.toHaveBeenCalled()
    vi.mocked(createCollection).mockResolvedValue({
      ...detail,
      collectionId: 9,
    })
    await user.type(screen.getByLabelText('컬렉션명'), 'B 초안')
    await user.click(screen.getByRole('radio', { name: '빨강' }))
    await user.click(screen.getByRole('button', { name: '만들기' }))
    await screen.findByText(/원래 화면/)
    expect(router.state.location.state).toBeNull()
  })

  it('생성 응답 전에는 복귀하지 않고 서버 ID를 캐시에 반영한 뒤 원래 저장 상태로 복귀한다', async () => {
    let finish!: (value: typeof detail) => void
    vi.mocked(createCollection).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    const { user, client, router } = setup()
    await user.type(screen.getByLabelText('컬렉션명'), '  여행  ')
    await user.click(screen.getByRole('radio', { name: '빨강' }))
    fireEvent.change(screen.getByLabelText('설명'), {
      target: { value: '첫 줄\n둘째 줄' },
    })
    await user.click(screen.getByRole('button', { name: '만들기' }))
    expect(createCollection).toHaveBeenCalledExactlyOnceWith({
      name: '  여행  ',
      color: 'red',
      description: '첫 줄 둘째 줄',
      visibility: 'public',
    })
    expect(router.state.location.pathname).toBe('/saved/collections/new')
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()
    await act(async () => finish({ ...detail, collectionId: 42 }))
    expect(await screen.findByText(/원래 화면/)).toBeVisible()
    expect(client.getQueryData(collectionQueryKeys.detail(42))).toMatchObject({
      collectionId: 42,
    })
    expect(router.state.location.key).toBe('return-key')
    expect(router.state.location.state).toEqual({
      collectionSaveRestaurantId: '55',
      collectionSaveSelectedId: '7',
    })
    expect(getCollection).not.toHaveBeenCalled()
  })

  it('서버 중복 이름 오류는 입력을 유지하고 이름 수정 후 재시도하며 공통 토스트와 중복 안내하지 않는다', async () => {
    vi.mocked(createCollection)
      .mockRejectedValueOnce(
        new ApiError(
          {
            success: false,
            code: 'USER-007',
            message: 'duplicate',
            data: null,
            timestamp: '2026-10-20T03:00:00Z',
            path: '/api/v1/collections',
          },
          409,
        ),
      )
      .mockResolvedValueOnce({ ...detail, collectionId: 42 })
    const { user, router, onError } = setup()
    await user.type(screen.getByLabelText('컬렉션명'), '여행')
    await user.click(screen.getByRole('radio', { name: '빨강' }))
    await user.click(screen.getByRole('button', { name: '만들기' }))
    expect(await screen.findByText('중복된 컬렉션명입니다.')).toBeVisible()
    expect(screen.getByLabelText('컬렉션명')).toHaveValue('여행')
    expect(router.state.location.pathname).toBe('/saved/collections/new')
    expect(onError).not.toHaveBeenCalled()
    expect(captureError).toHaveBeenCalledExactlyOnceWith(expect.any(ApiError))
    await user.type(screen.getByLabelText('컬렉션명'), '2')
    await user.click(screen.getByRole('button', { name: '만들기' }))
    expect(await screen.findByText(/원래 화면/)).toBeVisible()
    expect(createCollection).toHaveBeenCalledTimes(2)
  })

  it('수정 초기값을 조회하고 비운 설명만 PATCH하며 실패 시 입력과 기존 캐시를 보존한다', async () => {
    vi.mocked(getCollection).mockResolvedValue(detail)
    vi.mocked(updateCollection)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ ...detail, description: '' })
    const { user, client, router, onError } = setup(true)
    expect(screen.getByRole('status')).toBeVisible()
    expect(await screen.findByDisplayValue('여행')).toBeVisible()
    await user.clear(screen.getByLabelText('설명'))
    await user.click(screen.getByRole('button', { name: '저장하기' }))
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(updateCollection).toHaveBeenLastCalledWith(8, { description: '' })
    expect(screen.getByLabelText('설명')).toHaveValue('')
    expect(client.getQueryData(collectionQueryKeys.detail(8))).toEqual(detail)
    expect(router.state.location.pathname).toBe('/saved/collections/8/edit')
    expect(onError).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '저장하기' }))
    expect(await screen.findByText(/원래 화면/)).toBeVisible()
    expect(client.getQueryData(collectionQueryKeys.detail(8))).toMatchObject({
      description: '',
    })
  })

  it('배경 갱신·조회 실패가 입력을 지우거나 변경하지 않은 필드를 PATCH에 포함하지 않는다', async () => {
    vi.mocked(getCollection).mockResolvedValue(detail)
    vi.mocked(updateCollection).mockResolvedValue({
      ...detail,
      name: '수정',
      description: '서버 설명',
    })
    const { user, client } = setup(true)
    expect(await screen.findByDisplayValue('여행')).toBeVisible()
    await user.clear(screen.getByLabelText('컬렉션명'))
    await user.type(screen.getByLabelText('컬렉션명'), '수정')
    await act(async () => {
      client.setQueryData(collectionQueryKeys.detail(8), {
        ...detail,
        name: '서버 이름',
        description: '서버 설명',
      })
    })
    vi.mocked(getCollection).mockRejectedValueOnce(new Error('offline'))
    await act(async () => {
      await client.refetchQueries({
        queryKey: collectionQueryKeys.detail(8),
        exact: true,
      })
    })
    expect(screen.getByLabelText('컬렉션명')).toHaveValue('수정')
    expect(screen.getByLabelText('설명')).toHaveValue('설명')
    await user.click(screen.getByRole('button', { name: '저장하기' }))
    expect(await screen.findByText(/원래 화면/)).toBeVisible()
    expect(updateCollection).toHaveBeenCalledExactlyOnceWith(8, {
      name: '수정',
    })
  })

  it('서버의 기존 31자 설명을 자르지 않고 프론트의 확정된 30자 저장 제한을 적용한다', async () => {
    vi.mocked(getCollection).mockResolvedValue({
      ...detail,
      description: '가'.repeat(31),
    })
    vi.mocked(updateCollection).mockResolvedValue({
      ...detail,
      description: '가'.repeat(30),
    })
    const { user } = setup(true)
    expect(await screen.findByDisplayValue('가'.repeat(31))).toBeVisible()
    expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled()
    expect(updateCollection).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('설명'), {
      target: { value: '가'.repeat(30) },
    })
    await user.click(screen.getByRole('button', { name: '저장하기' }))
    expect(await screen.findByText(/원래 화면/)).toBeVisible()
    expect(updateCollection).toHaveBeenCalledExactlyOnceWith(8, {
      description: '가'.repeat(30),
    })
  })

  it('소유자가 아니면 수정 폼을 표시하거나 PATCH하지 않는다', async () => {
    vi.mocked(getCollection).mockResolvedValue({ ...detail, owner: false })
    setup(true)
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(
      screen.queryByRole('button', { name: '저장하기' }),
    ).not.toBeInTheDocument()
    expect(updateCollection).not.toHaveBeenCalled()
  })
})
