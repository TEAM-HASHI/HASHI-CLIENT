import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { MagazineDetailPage } from '@/pages/magazineDetail/MagazineDetailPage'
import { request } from '@/shared/api/request'
import { HttpStatusError } from '@/shared/api/apiError'
import { clearAuthSession, setAccessToken } from '@/shared/auth/authSession'

const params = vi.hoisted(() => ({ magazineId: '1' }))
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  )),
  useParams: () => params,
}))
vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))
vi.mock('@/features/auth/hooks/useKakaoOAuthStart', () => ({
  useKakaoOAuthStart: () => ({ startKakaoOAuth: vi.fn() }),
}))

const detail = {
  magazineId: 1,
  title: '서버 매거진',
  content: '서버 본문',
  hashtags: ['도쿄'],
  createdAt: '2026-10-17T10:00:00',
  liked: false,
  likeCount: 10,
  cardNewsImageUrls: ['https://example.com/cover.jpg'],
  restaurants: [],
}
const renderPage = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 30_000 },
      mutations: { retry: false },
    },
  })
  const ui = () => (
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <MagazineDetailPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { ...render(ui()), ui }
}
beforeEach(() => {
  vi.stubEnv('DEV', false)
  params.magazineId = '1'
  vi.mocked(request).mockResolvedValue(detail)
  setAccessToken('account-a')
})
afterEach(() => {
  cleanup()
  clearAuthSession()
  vi.resetAllMocks()
  vi.unstubAllEnvs()
})

it('opens the login gate without changing likes or sending a mutation', async () => {
  clearAuthSession()
  renderPage()
  const button = await screen.findByRole('button', { name: /매거진 좋아요/ })
  fireEvent.click(button)
  expect(button).toHaveAttribute('aria-pressed', 'false')
  expect(button).toHaveTextContent('10')
  expect(
    screen.getByRole('dialog', { name: '로그인 안내' }),
  ).toBeInTheDocument()
  expect(
    vi.mocked(request).mock.calls.every(([, options]) => !options?.method),
  ).toBe(true)
})

it('optimistically updates once for immediate repeated clicks and rolls back on failure', async () => {
  let rejectLike!: (error: Error) => void
  vi.mocked(request).mockImplementation(async (_path, options) => {
    if (options?.method)
      return new Promise((_resolve, reject) => {
        rejectLike = reject
      })
    return detail
  })
  renderPage()
  const button = await screen.findByRole('button', { name: /매거진 좋아요/ })
  act(() => {
    fireEvent.click(button)
    fireEvent.click(button)
  })
  await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'))
  expect(button).toHaveTextContent('11')
  expect(
    vi.mocked(request).mock.calls.filter(([, options]) => options?.method),
  ).toHaveLength(1)
  await act(async () => {
    rejectLike(new Error('failed'))
  })
  await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'false'))
  expect(button).toHaveTextContent('10')
})

it('reconciles with server counts and sends DELETE for an existing like', async () => {
  let liked = false
  vi.mocked(request).mockImplementation(async (_path, options) => {
    if (options?.method) {
      liked = options.method === 'post'
      return { magazineId: 1, liked, likeCount: liked ? 25 : 24 }
    }
    return { ...detail, liked, likeCount: liked ? 25 : 24 }
  })
  renderPage()
  fireEvent.click(await screen.findByRole('button', { name: /매거진 좋아요/ }))
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: /좋아요 취소/ }),
    ).toHaveTextContent('25'),
  )
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /좋아요 취소/ })).toBeEnabled(),
  )
  fireEvent.click(screen.getByRole('button', { name: /좋아요 취소/ }))
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: /매거진 좋아요/ }),
    ).toHaveTextContent('24'),
  )
  expect(request).toHaveBeenCalledWith(
    '/api/v1/magazines/1/likes',
    expect.objectContaining({ method: 'delete' }),
  )
})

it('keeps an in-flight like active during same-session token refresh', async () => {
  let resolveLike!: (value: unknown) => void
  let signal: AbortSignal | null | undefined
  let liked = false
  vi.mocked(request).mockImplementation(async (_path, options) => {
    if (options?.method) {
      signal = options.signal
      return new Promise((resolve) => {
        resolveLike = resolve
      })
    }
    return { ...detail, liked, likeCount: liked ? 25 : 10 }
  })
  renderPage()
  fireEvent.click(await screen.findByRole('button', { name: /매거진 좋아요/ }))
  await waitFor(() => expect(resolveLike).toBeTypeOf('function'))
  act(() => setAccessToken('refreshed-token'))
  expect(signal?.aborted).toBe(false)
  expect(screen.getByRole('button', { name: /좋아요 취소/ })).toBeDisabled()
  await act(async () => {
    liked = true
    resolveLike({ magazineId: 1, liked: true, likeCount: 25 })
  })
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: /좋아요 취소/ }),
    ).toHaveTextContent('25'),
  )
})

it('does not apply a late like response to a different magazine', async () => {
  let resolveLike!: (value: unknown) => void
  vi.mocked(request).mockImplementation(async (path, options) => {
    if (options?.method)
      return new Promise((resolve) => {
        resolveLike = resolve
      })
    return { ...detail, magazineId: path.endsWith('/2') ? 2 : 1 }
  })
  const { rerender, ui } = renderPage()
  fireEvent.click(await screen.findByRole('button', { name: /매거진 좋아요/ }))
  await waitFor(() => expect(resolveLike).toBeTypeOf('function'))
  params.magazineId = '2'
  rerender(ui())
  await screen.findByRole('button', { name: /매거진 좋아요/ })
  await act(async () => {
    resolveLike({ magazineId: 1, liked: true, likeCount: 99 })
  })
  expect(
    screen.getByRole('button', { name: /매거진 좋아요/ }),
  ).toHaveTextContent('10')
})

it('refetches an aborted optimistic like when returning within the cache stale time', async () => {
  vi.mocked(request).mockImplementation(async (path, options) => {
    if (options?.method)
      return new Promise((_resolve, reject) => {
        options.signal?.addEventListener(
          'abort',
          () => reject(new DOMException('Aborted', 'AbortError')),
          { once: true },
        )
      })
    return { ...detail, magazineId: path.endsWith('/2') ? 2 : 1 }
  })
  const { rerender, ui } = renderPage()
  fireEvent.click(await screen.findByRole('button', { name: /매거진 좋아요/ }))
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: /좋아요 취소/ }),
    ).toHaveTextContent('11'),
  )
  await waitFor(() =>
    expect(request).toHaveBeenCalledWith(
      '/api/v1/magazines/1/likes',
      expect.objectContaining({ method: 'post' }),
    ),
  )
  params.magazineId = '2'
  rerender(ui())
  await screen.findByRole('button', { name: /매거진 좋아요/ })
  params.magazineId = '1'
  rerender(ui())
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: /매거진 좋아요/ }),
    ).toHaveTextContent('10'),
  )
  expect(
    vi
      .mocked(request)
      .mock.calls.filter(([path]) => path === '/api/v1/magazines/1'),
  ).toHaveLength(2)
})

it.each(['account-b', 'account-a'])(
  'does not apply an old response after logging out and logging in with %s',
  async (token) => {
    let resolveLike!: (value: unknown) => void
    vi.mocked(request).mockImplementation(async (_path, options) => {
      if (options?.method)
        return new Promise((resolve) => {
          resolveLike = resolve
        })
      return detail
    })
    renderPage()
    fireEvent.click(
      await screen.findByRole('button', { name: /매거진 좋아요/ }),
    )
    await waitFor(() => expect(resolveLike).toBeTypeOf('function'))
    act(() => {
      clearAuthSession()
      setAccessToken(token)
    })
    await screen.findByRole('button', { name: /매거진 좋아요/ })
    await act(async () => {
      resolveLike({ magazineId: 1, liked: true, likeCount: 99 })
    })
    expect(
      screen.getByRole('button', { name: /매거진 좋아요/ }),
    ).toHaveTextContent('10')
  },
)

it.each([404, 500])(
  'handles a %s detail failure without showing preview content',
  async (status) => {
    vi.mocked(request).mockRejectedValueOnce(new HttpStatusError(status))
    renderPage()
    if (status === 404) {
      expect(
        await screen.findByText('매거진을 찾을 수 없습니다.'),
      ).toBeInTheDocument()
    } else {
      fireEvent.click(await screen.findByRole('button', { name: '다시 시도' }))
      expect(await screen.findByText('서버 본문')).toBeInTheDocument()
    }
  },
)
