import '@testing-library/jest-dom/vitest'

import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import AsyncBoundary from '@/app/providers/AsyncBoundary'
import { getNotices } from '@/features/notice/api/getNotices'
import type { NoticeSummary } from '@/features/notice/types'
import { NoticesPage } from '@/pages/notices/NoticesPage'
import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import { createQueryClient } from '@/shared/lib/queryClient'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'

const { mockNavigate, mockNavigationType } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockNavigationType: { current: 'PUSH' as 'PUSH' | 'POP' | 'REPLACE' },
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useNavigationType: () => mockNavigationType.current,
  }
})

vi.mock('@/features/notice/api/getNotices', () => ({ getNotices: vi.fn() }))

const mockedGetNotices = vi.mocked(getNotices)

const createNotice = (
  noticeId: number,
  overrides: Partial<NoticeSummary> = {},
): NoticeSummary => ({
  noticeId,
  title: `[공지 ${noticeId}]`,
  lastModifiedAt: '2026-09-01T10:00:00',
  ...overrides,
})

const badRequest = new ApiError(
  {
    success: false,
    code: 'COMMON-400',
    message: 'bad request',
    data: null,
    timestamp: '',
    path: '/api/v1/notices',
  },
  400,
)

const renderNoticesPage = (queryClient: QueryClient = createQueryClient()) =>
  render(
    <QueryClientProvider client={queryClient}>
      <AsyncBoundary>
        <NoticesPage />
      </AsyncBoundary>
    </QueryClientProvider>,
  )

describe('NoticesPage', () => {
  beforeEach(() => {
    mockIntersectionObserver({ isIntersecting: false })
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    mockNavigate.mockClear()
    mockedGetNotices.mockReset()
    mockNavigationType.current = 'PUSH'
    vi.mocked(window.scrollTo).mockClear()
    vi.restoreAllMocks()
    sessionStorage.clear()
    window.history.replaceState(null, '')
  })

  it('shows an empty message when no notice is published', async () => {
    mockedGetNotices.mockResolvedValue({
      notices: [],
      hasNext: false,
      nextCursor: null,
    })
    renderNoticesPage()
    expect(
      await screen.findByText('등록된 공지사항이 없어요.'),
    ).toBeInTheDocument()
    expect(mockedGetNotices).toHaveBeenCalledTimes(1)
  })

  it('shows the server lastModifiedAt date', async () => {
    mockedGetNotices.mockResolvedValue({
      notices: [
        createNotice(3, {
          title: '[Hashi 첫 공지사항]',
          lastModifiedAt: '2026-09-06T09:00:00',
        }),
        createNotice(2, {
          title: '[Hashi 다음 공지사항]',
          lastModifiedAt: '2026-09-02T10:00:00',
        }),
      ],
      hasNext: false,
      nextCursor: null,
    })

    renderNoticesPage()

    const rows = await screen.findAllByRole('button', { name: /^\[Hashi/ })

    expect(rows.map((row) => row.textContent)).toEqual([
      '[Hashi 첫 공지사항]2026.09.06',
      '[Hashi 다음 공지사항]2026.09.02',
    ])
    expect(mockedGetNotices).toHaveBeenCalledWith({ cursor: null })
  })

  it('keeps a notice title on a single truncated line', async () => {
    mockedGetNotices.mockResolvedValue({
      notices: [createNotice(3, { title: '아주 긴 공지 제목'.repeat(10) })],
      hasNext: false,
      nextCursor: null,
    })

    renderNoticesPage()

    expect(await screen.findByText('아주 긴 공지 제목'.repeat(10))).toHaveClass(
      'truncate',
    )
  })

  it('navigates to the notice detail when a row is pressed', async () => {
    mockedGetNotices.mockResolvedValue({
      notices: [createNotice(3)],
      hasNext: false,
      nextCursor: null,
    })
    renderNoticesPage()
    fireEvent.click(await screen.findByRole('button', { name: /\[공지 3\]/ }))
    expect(mockNavigate).toHaveBeenCalledWith('/notices/3', {
      state: { fromNoticeList: true },
    })
    expect(
      JSON.parse(sessionStorage.getItem('hashi:notice-list-state')!),
    ).toEqual({ scrollY: window.scrollY, pageCount: 1 })
  })

  it('shows the common error screen when the first page fails and retries from the first page', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockedGetNotices.mockRejectedValueOnce(badRequest)
    mockedGetNotices.mockResolvedValueOnce({
      notices: [createNotice(3)],
      hasNext: false,
      nextCursor: null,
    })

    renderNoticesPage()

    fireEvent.click(await screen.findByRole('button', { name: '다시 시도' }))

    expect(
      await screen.findByRole('button', { name: /\[공지 3\]/ }),
    ).toBeInTheDocument()
    expect(mockedGetNotices).toHaveBeenLastCalledWith({
      cursor: null,
    })
  })

  it('keeps loaded notices and offers a retry when the next page fails', async () => {
    const { triggerAllIntersects } = mockIntersectionObserver()

    mockedGetNotices.mockImplementation(async ({ cursor }) => {
      if (cursor === null) {
        return {
          notices: [createNotice(3)],
          hasNext: true,
          nextCursor: 'cursor-3',
        }
      }

      throw badRequest
    })

    renderNoticesPage()

    await screen.findByRole('button', { name: /\[공지 3\]/ })
    triggerAllIntersects()

    const retryButton = await screen.findByRole('button', {
      name: '다음 공지 다시 불러오기',
    })

    expect(
      screen.getByRole('button', { name: /\[공지 3\]/ }),
    ).toBeInTheDocument()

    mockedGetNotices.mockImplementation(async ({ cursor }) =>
      cursor === null
        ? { notices: [createNotice(3)], hasNext: true, nextCursor: 'cursor-3' }
        : { notices: [createNotice(2)], hasNext: false, nextCursor: null },
    )
    fireEvent.click(retryButton)

    expect(
      await screen.findByRole('button', { name: /\[공지 2\]/ }),
    ).toBeInTheDocument()
  })

  it('restores the scroll position when returning from a notice detail', async () => {
    const queryClient = createQueryClient()

    mockedGetNotices.mockResolvedValue({
      notices: [createNotice(3)],
      hasNext: false,
      nextCursor: null,
    })

    const { unmount } = renderNoticesPage(queryClient)

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 480 })
    fireEvent.click(await screen.findByRole('button', { name: /\[공지 3\]/ }))
    unmount()

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
    mockNavigationType.current = 'POP'
    renderNoticesPage(queryClient)

    await waitFor(() => {
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 480 })
    })
  })

  it('restores expired pages before scrolling and avoids duplicate observer requests', async () => {
    sessionStorage.setItem(
      'hashi:notice-list-state',
      JSON.stringify({ scrollY: 480, pageCount: 3 }),
    )
    mockNavigationType.current = 'POP'
    const { triggerAllIntersects } = mockIntersectionObserver()
    mockedGetNotices.mockImplementation(async ({ cursor }) => ({
      notices: [
        createNotice(cursor === null ? 3 : cursor === 'cursor-3' ? 2 : 1),
      ],
      hasNext: cursor !== 'cursor-2',
      nextCursor:
        cursor === null
          ? 'cursor-3'
          : cursor === 'cursor-3'
            ? 'cursor-2'
            : null,
    }))
    renderNoticesPage()
    triggerAllIntersects()
    await screen.findByRole('button', { name: /\[공지 1\]/ })
    await waitFor(() =>
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 480 }),
    )
    expect(
      mockedGetNotices.mock.calls.map(([params]) => params.cursor),
    ).toEqual([null, 'cursor-3', 'cursor-2'])
  })

  it('keeps loaded notices and resumes restoration after a next-page retry', async () => {
    sessionStorage.setItem(
      'hashi:notice-list-state',
      JSON.stringify({ scrollY: 480, pageCount: 2 }),
    )
    mockNavigationType.current = 'POP'
    mockedGetNotices.mockResolvedValueOnce({
      notices: [createNotice(3)],
      hasNext: true,
      nextCursor: 'cursor-3',
    })
    mockedGetNotices.mockRejectedValueOnce(badRequest)
    mockedGetNotices.mockResolvedValueOnce({
      notices: [createNotice(2)],
      hasNext: false,
      nextCursor: null,
    })
    renderNoticesPage()
    fireEvent.click(
      await screen.findByRole('button', { name: '다음 공지 다시 불러오기' }),
    )
    await screen.findByRole('button', { name: /\[공지 2\]/ })
    await waitFor(() =>
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 480 }),
    )
  })

  it('falls back to mypage when there is no previous app history', async () => {
    mockedGetNotices.mockResolvedValue({
      notices: [],
      hasNext: false,
      nextCursor: null,
    })

    renderNoticesPage()

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(mockNavigate).toHaveBeenCalledWith('/mypage', { replace: true })
  })

  it('returns to the previous app screen rather than always replacing with mypage', () => {
    window.history.replaceState({ idx: 1 }, '')
    mockedGetNotices.mockResolvedValue({
      notices: [],
      hasNext: false,
      nextCursor: null,
    })
    renderNoticesPage()
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('keeps the list after HTTP 500 and one automatic next-page retry', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { triggerAllIntersects } = mockIntersectionObserver()
    const queryClient = createQueryClient()
    queryClient.setDefaultOptions({
      queries: { ...queryClient.getDefaultOptions().queries, retryDelay: 0 },
    })
    mockedGetNotices.mockImplementation(async ({ cursor }) => {
      if (cursor !== null) throw new HttpStatusError(500)
      return {
        notices: [createNotice(3)],
        hasNext: true,
        nextCursor: 'cursor-3',
      }
    })
    renderNoticesPage(queryClient)
    await screen.findByRole('button', { name: /\[공지 3\]/ })
    triggerAllIntersects()
    await screen.findByRole('button', { name: '다음 공지 다시 불러오기' })
    expect(
      screen.getByRole('button', { name: /\[공지 3\]/ }),
    ).toBeInTheDocument()
    expect(
      mockedGetNotices.mock.calls.filter(
        ([params]) => params.cursor === 'cursor-3',
      ),
    ).toHaveLength(2)
  })
})
