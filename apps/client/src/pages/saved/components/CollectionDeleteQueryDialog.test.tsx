import { showToast } from '@hashi/hds-ui'
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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getCollection } from '@/features/collection/api/getCollection'
import { deleteCollection } from '@/features/collection/api/deleteCollection'
import { removeSavedRestaurants } from '@/features/collection/api/removeSavedRestaurants'
import { CollectionDeleteQueryDialog } from '@/pages/saved/components/CollectionDeleteQueryDialog'
import { collectionQueryKeys } from '@/features/collection/queries/collectionQueryKeys'
import {
  clearAuthSession,
  setAccessToken,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

vi.mock('@hashi/hds-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@hashi/hds-ui')>()),
  showToast: vi.fn(),
}))

vi.mock('@/features/collection/api/getCollection', () => ({
  getCollection: vi.fn(),
}))
vi.mock('@/features/collection/api/deleteCollection', () => ({
  deleteCollection: vi.fn(),
}))
vi.mock('@/features/collection/api/removeSavedRestaurants', () => ({
  removeSavedRestaurants: vi.fn(),
}))
vi.mock('@/features/collection/api/saveRestaurant', () => ({
  saveRestaurant: vi.fn(),
}))
vi.mock('@/features/collection/api/moveSavedRestaurants', () => ({
  moveSavedRestaurants: vi.fn(),
}))
vi.mock('@/shared/lib/sentry', () => ({ captureError: vi.fn() }))

const detail = { collectionId: 8, name: '여행', owner: true, savedCount: 3 }
const clients: QueryClient[] = []
const setup = (kind: 'collection' | 'restaurants') => {
  const onClose = vi.fn()
  const onDeleted = vi.fn()
  const onRemoved = vi.fn()
  const onError = vi.fn()
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, onError },
    },
  })
  clients.push(client)
  const Host = () => {
    const [open, setOpen] = useState(true)
    const close = () => {
      onClose()
      setOpen(false)
    }
    if (!open) return null
    return kind === 'collection' ? (
      <CollectionDeleteQueryDialog
        kind="collection"
        collectionId={8}
        onClose={close}
        onDeleted={onDeleted}
      />
    ) : (
      <CollectionDeleteQueryDialog
        kind="restaurants"
        collectionId={8}
        restaurantIds={[55, 56]}
        onRemoved={onRemoved}
        onClose={close}
      />
    )
  }
  const rendered = render(
    <QueryClientProvider client={client}>
      <Host />
    </QueryClientProvider>,
  )
  return {
    client,
    onClose,
    onDeleted,
    onRemoved,
    onError,
    user: userEvent.setup(),
    unmount: rendered.unmount,
  }
}

beforeEach(() => {
  vi.resetAllMocks()
  setAccessToken('test-session')
  vi.mocked(getCollection).mockResolvedValue(detail)
})
afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
  clearAuthSession()
})

describe('컬렉션 서버 삭제 확인', () => {
  it('식당 해제 대기 중 중복·닫기를 막고 실패 시 선택·데이터를 유지한 뒤 성공 시에만 정리한다', async () => {
    let reject!: (reason: Error) => void
    vi.mocked(removeSavedRestaurants)
      .mockImplementationOnce(
        () =>
          new Promise((_, fail) => {
            reject = fail
          }),
      )
      .mockResolvedValueOnce({ ...detail, savedCount: 1 })
    const { user, client, onRemoved, onClose, onError } = setup('restaurants')
    const confirm = screen.getByRole('button', { name: '삭제하기' })
    await waitFor(() => expect(confirm).toBeEnabled())
    fireEvent.click(confirm)
    fireEvent.click(confirm)
    await waitFor(() =>
      expect(removeSavedRestaurants).toHaveBeenCalledExactlyOnceWith(
        8,
        [55, 56],
      ),
    )
    expect(screen.getByRole('button', { name: '취소하기' })).toBeDisabled()
    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
    await act(async () => reject(new Error('offline')))
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(client.getQueryData(collectionQueryKeys.detail(8))).toEqual(detail)
    expect(onRemoved).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '삭제하기' }))
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(onRemoved).toHaveBeenCalledExactlyOnceWith([55, 56])
    expect(client.getQueryData(collectionQueryKeys.detail(8))).toMatchObject({
      savedCount: 1,
    })
  })

  it('소유자 조회 후 삭제하며 실패하면 복귀하지 않고 재시도 성공 후에만 캐시를 지우고 복귀한다', async () => {
    let finish!: (value: typeof detail) => void
    vi.mocked(getCollection).mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    vi.mocked(deleteCollection)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(undefined)
    const { user, client, onDeleted, onClose } = setup('collection')
    expect(screen.getByRole('button', { name: '삭제하기' })).toBeDisabled()
    await act(async () => finish(detail))
    await user.click(screen.getByRole('button', { name: '삭제하기' }))
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(onDeleted).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(showToast).not.toHaveBeenCalled()
    expect(client.getQueryData(collectionQueryKeys.detail(8))).toEqual(detail)
    await user.click(screen.getByRole('button', { name: '삭제하기' }))
    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(client.getQueryData(collectionQueryKeys.detail(8))).toBeUndefined()
    expect(deleteCollection).toHaveBeenNthCalledWith(2, 8)
    expect(showToast).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ children: '컬렉션이 삭제되었어요.' }),
    )
  })

  it('삭제 대기 중 화면을 떠났으면 늦은 성공 응답으로 복귀시키지 않는다', async () => {
    let finish!: () => void
    vi.mocked(deleteCollection).mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    const { user, unmount, onClose, onDeleted } = setup('collection')
    const confirm = screen.getByRole('button', { name: '삭제하기' })
    await waitFor(() => expect(confirm).toBeEnabled())
    await user.click(confirm)
    unmount()
    await act(async () => finish())
    expect(onDeleted).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(showToast).not.toHaveBeenCalled()
  })

  it('계정 변경 후 도착한 삭제 성공에는 완료 토스트를 표시하지 않는다', async () => {
    startAuthenticatedSession('account-a', 1)
    let finish!: () => void
    vi.mocked(deleteCollection).mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    const { user, onClose, onDeleted } = setup('collection')
    const confirm = screen.getByRole('button', { name: '삭제하기' })
    await waitFor(() => expect(confirm).toBeEnabled())
    await user.click(confirm)
    act(() => startAuthenticatedSession('account-b', 2))
    await act(async () => finish())
    expect(showToast).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('다른 사람의 컬렉션은 삭제 요청을 보내지 않는다', async () => {
    vi.mocked(getCollection).mockResolvedValue({ ...detail, owner: false })
    setup('collection')
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(screen.getByRole('button', { name: '삭제하기' })).toBeDisabled()
    expect(deleteCollection).not.toHaveBeenCalled()
  })
})
