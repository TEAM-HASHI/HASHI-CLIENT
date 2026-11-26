import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
  type Location,
} from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CollectionFormQueryPage } from '@/pages/saved/CollectionFormQueryPage'
import { CollectionTargetQueryDialog } from '@/features/collection/components/CollectionTargetQueryDialog'
import { saveRestaurant } from '@/features/collection/api/saveRestaurant'
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
vi.mock('@/features/collection/api/saveRestaurant', () => ({
  saveRestaurant: vi.fn(),
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
const setup = ({
  editing = false,
  fromSaveDialog = false,
  initialEntries,
}: {
  editing?: boolean
  fromSaveDialog?: boolean
  initialEntries?: (string | Partial<Location>)[]
} = {}) => {
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
      {
        path: '/saved',
        element: fromSaveDialog ? (
          <CollectionTargetQueryDialog
            mode="save"
            restaurantId={55}
            onClose={() => {}}
          />
        ) : (
          <Returned />
        ),
      },
      { path: '/saved/collections/new', element: <CollectionFormQueryPage /> },
      {
        path: '/saved/collections/:collectionId/edit',
        element: <CollectionFormQueryPage />,
      },
    ],
    {
      initialEntries: initialEntries ?? [
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
      ...(fromSaveDialog && { initialIndex: 0 }),
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
  it('생성을 취소하면 요청 없이 원래 방문 이력으로 복귀한다', async () => {
    const { user, router } = setup()
    await user.type(screen.getByLabelText('컬렉션명'), '작성 중인 컬렉션')
    await user.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(await screen.findByText(/원래 화면/)).toBeVisible()
    expect(router.state.location.key).toBe('return-key')
    expect(createCollection).not.toHaveBeenCalled()
  })

  it.each([
    null,
    { collectionReturn: { pathname: '//example.com', search: '' } },
  ])(
    '유효한 복귀 정보가 없는 직접 생성 URL의 헤더 뒤로가기는 저장 목록을 연다',
    async (state) => {
      const { user, router } = setup({
        initialEntries: [{ pathname: '/saved/collections/new', state }],
      })
      await user.click(screen.getByRole('button', { name: '뒤로가기' }))
      expect(router.state.location.pathname).toBe('/saved')
      expect(createCollection).not.toHaveBeenCalled()
    },
  )

  it('형식이 잘못된 수정 ID는 상세를 조회하지 않고 저장 목록으로 보낸다', async () => {
    const { router } = setup({
      initialEntries: ['/saved/collections/missing/edit'],
    })
    expect(await screen.findByText(/원래 화면/)).toBeVisible()
    expect(router.state.location.pathname).toBe('/saved')
    expect(getCollection).not.toHaveBeenCalled()
  })

  it.each(['header', 'browser'])(
    '수정 중 %s 뒤로가기에서 계속하기는 입력을 보존하고 폐기는 저장 없이 목록으로 돌아간다',
    async (source) => {
      vi.mocked(getCollection).mockResolvedValue(detail)
      const { user, router } = setup({ editing: true })
      const name = await screen.findByDisplayValue('여행')
      await user.type(name, ' 수정')
      const goBack = async () => {
        if (source === 'header') {
          await user.click(screen.getByRole('button', { name: '뒤로가기' }))
        } else {
          await act(async () => {
            await router.navigate(-1)
          })
        }
        return screen.findByRole('alertdialog', {
          name: '변경사항이 저장되지 않았어요.',
        })
      }

      const keep = await goBack()
      await act(async () => {
        fireEvent.click(within(keep).getByRole('button', { name: '계속하기' }))
      })
      expect(name).toHaveValue('여행 수정')
      expect(router.state.location.pathname).toBe('/saved/collections/8/edit')
      const discard = await goBack()
      await act(async () => {
        fireEvent.click(
          within(discard).getByRole('button', { name: '뒤로가기' }),
        )
      })
      expect(router.state.location.pathname).toBe('/saved')
      expect(updateCollection).not.toHaveBeenCalled()
    },
  )

  it('저장창에서 생성한 컬렉션을 선택하고 기존 선택도 유지하며 저장은 확정할 때만 요청한다', async () => {
    const existing = { ...detail, name: '기존 컬렉션', saved: false }
    const created = {
      ...detail,
      collectionId: 42,
      name: '새 여행',
      saved: false,
    }
    const items = [existing]
    vi.mocked(getCollections).mockImplementation(async () => ({
      collections: [...items],
      totalCount: items.length,
      hasNext: false,
      nextCursor: undefined,
    }))
    vi.mocked(createCollection).mockImplementation(async () => {
      items.unshift(created)
      return created
    })
    vi.mocked(saveRestaurant).mockImplementation(async (id) =>
      id === 42 ? created : existing,
    )
    const { user } = setup({ fromSaveDialog: true })
    await user.click(
      await screen.findByRole('checkbox', { name: /기존 컬렉션/ }),
    )
    await user.click(screen.getByRole('button', { name: '새 컬렉션 만들기' }))
    await user.type(await screen.findByLabelText('컬렉션명'), '새 여행')
    await user.click(screen.getByRole('radio', { name: '빨강' }))
    const createButton = screen.getByRole('button', { name: '만들기' })
    await waitFor(() => expect(createButton).toBeEnabled())
    await user.click(createButton)

    expect(
      await screen.findByRole('checkbox', { name: /새 여행/ }),
    ).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /기존 컬렉션/ })).toBeChecked()
    expect(saveRestaurant).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '저장' }))
    await waitFor(() => {
      expect(saveRestaurant).toHaveBeenCalledWith(42, { restaurantId: 55 })
      expect(saveRestaurant).toHaveBeenCalledWith(8, { restaurantId: 55 })
    })
  })

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
      const { user } = setup({ editing: true })
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
    const { user } = setup({ editing: true })
    await screen.findByDisplayValue('여행')
    await user.click(screen.getByRole('radio', { name: '노랑' }))
    expect(screen.queryByText('중복된 컬렉션명입니다.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장하기' })).toBeEnabled()
  })

  it('다음 페이지의 이름을 서버 공백 기준으로 비교해 중복 요청을 막는다', async () => {
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
    setup()
    const name = screen.getByLabelText('컬렉션명')
    const submit = screen.getByRole('button', { name: '만들기' })
    fireEvent.change(name, { target: { value: '\u001c여행\u0085' } })
    expect(await screen.findByText('중복된 컬렉션명입니다.')).toBeVisible()
    expect(submit).toBeDisabled()
    expect(getCollections).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: 7 }),
      expect.any(AbortSignal),
    )
    expect(createCollection).not.toHaveBeenCalled()
    fireEvent.change(name, { target: { value: '\u001c\u0085' } })
    expect(submit).toBeDisabled()
    fireEvent.change(name, { target: { value: '\ufeff여행\ufeff' } })
    expect(screen.queryByText('중복된 컬렉션명입니다.')).not.toBeInTheDocument()
    expect(submit).toBeEnabled()
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
    expect(screen.getByRole('radio', { name: '빨강' })).toBeChecked()
    await user.type(screen.getByLabelText('컬렉션명'), '  여행  ')
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
    const { user, client, router, onError } = setup({ editing: true })
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
    const { user, client } = setup({ editing: true })
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
    const { user } = setup({ editing: true })
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
    setup({ editing: true })
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(
      screen.queryByRole('button', { name: '저장하기' }),
    ).not.toBeInTheDocument()
    expect(updateCollection).not.toHaveBeenCalled()
  })
})
