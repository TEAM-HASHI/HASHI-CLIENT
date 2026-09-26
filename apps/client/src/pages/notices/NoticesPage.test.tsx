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
import { ApiError } from '@/shared/api/apiError'
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
  publishedAt: '2026-09-01T10:00:00',
  updatedAt: null,
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
  })

  it('shows the last updated date and falls back to the published date', async () => {
    mockedGetNotices.mockResolvedValue({
      notices: [
        createNotice(3, {
          title: '[Hashi 첫 공지사항]',
          publishedAt: '2026-09-01T10:00:00',
          updatedAt: '2026-09-06T09:00:00',
        }),
        createNotice(2, {
          title: '[Hashi 다음 공지사항]',
          publishedAt: '2026-09-02T10:00:00',
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
    expect(mockedGetNotices).toHaveBeenCalledWith({ cursor: null, size: 10 })
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

    expect(mockNavigate).toHaveBeenCalledWith('/notices/3')
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
      size: 10,
    })
  })

  it('keeps loaded notices and offers a retry when the next page fails', async () => {
    const { triggerAllIntersects } = mockIntersectionObserver()

    mockedGetNotices.mockImplementation(async ({ cursor }) => {
      if (cursor === null) {
        return { notices: [createNotice(3)], hasNext: true, nextCursor: 3 }
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
        ? { notices: [createNotice(3)], hasNext: true, nextCursor: 3 }
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

  it('goes back when the back button is pressed', async () => {
    mockedGetNotices.mockResolvedValue({
      notices: [],
      hasNext: false,
      nextCursor: null,
    })

    renderNoticesPage()

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
