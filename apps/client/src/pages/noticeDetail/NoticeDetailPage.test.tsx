import '@testing-library/jest-dom/vitest'

import { QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getNoticeDetail } from '@/features/notice/api/getNoticeDetail'
import type { NoticeDetail } from '@/features/notice/types'
import { NoticeDetailPage } from '@/pages/noticeDetail/NoticeDetailPage'
import { ApiError } from '@/shared/api/apiError'
import { createQueryClient } from '@/shared/lib/queryClient'

const { mockNavigate, mockParams } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockParams: { noticeId: '3' } as { noticeId?: string },
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  }
})

vi.mock('@/features/notice/api/getNoticeDetail', () => ({
  getNoticeDetail: vi.fn(),
}))

const mockedGetNoticeDetail = vi.mocked(getNoticeDetail)

const noticeDetailFixture: NoticeDetail = {
  noticeId: 3,
  title: '[Hashi 첫 공지사항]',
  publishedAt: '2026-09-01T10:00:00',
  updatedAt: '2026-09-06T10:00:00',
  content: '<p>시스템 <strong>점검</strong>을 진행합니다.</p>',
  images: [
    { url: 'https://example.com/notice-1.png', width: 706, height: 354 },
    { url: 'https://example.com/notice-2.png', width: 300, height: 600 },
  ],
}

const renderNoticeDetailPage = () =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>
        <NoticeDetailPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )

describe('NoticeDetailPage', () => {
  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
    mockedGetNoticeDetail.mockReset()
    mockParams.noticeId = '3'
  })

  it('renders the title, last updated date, and formatted content', async () => {
    mockedGetNoticeDetail.mockResolvedValue(noticeDetailFixture)

    renderNoticeDetailPage()

    expect(
      await screen.findByRole('heading', { name: '[Hashi 첫 공지사항]' }),
    ).toBeInTheDocument()
    expect(mockedGetNoticeDetail).toHaveBeenCalledWith(3)
    expect(screen.getByText('2026.09.06')).toBeInTheDocument()
    expect(screen.getByText('점검').tagName).toBe('STRONG')
  })

  it('renders attached images in order keeping their original ratio', async () => {
    mockedGetNoticeDetail.mockResolvedValue(noticeDetailFixture)

    renderNoticeDetailPage()

    const images = await screen.findAllByRole('img', {
      name: /\[Hashi 첫 공지사항\] 첨부 이미지/,
    })

    expect(images.map((image) => image.getAttribute('src'))).toEqual([
      'https://example.com/notice-1.png',
      'https://example.com/notice-2.png',
    ])
    expect(
      screen.getByRole('button', { name: '첨부 이미지 1 크게 보기' }),
    ).toHaveStyle({ aspectRatio: '706 / 354' })
  })

  it('keeps the image area and shows the common placeholder when an image fails', async () => {
    mockedGetNoticeDetail.mockResolvedValue(noticeDetailFixture)

    renderNoticeDetailPage()

    const [firstImage] = await screen.findAllByRole('img', {
      name: /첨부 이미지/,
    })

    fireEvent.error(firstImage as HTMLImageElement)

    const firstImageButton = screen.getByRole('button', {
      name: '첨부 이미지 1 크게 보기',
    })

    expect(firstImageButton).toHaveStyle({ aspectRatio: '706 / 354' })
    expect(
      firstImageButton.querySelector('[data-slot="image-fallback"]'),
    ).not.toBeNull()
    expect(screen.getAllByRole('img', { name: /첨부 이미지/ })).toHaveLength(1)
  })

  it('opens the full screen viewer at the selected image', async () => {
    mockedGetNoticeDetail.mockResolvedValue(noticeDetailFixture)

    renderNoticeDetailPage()

    fireEvent.click(
      await screen.findByRole('button', { name: '첨부 이미지 2 크게 보기' }),
    )

    const viewer = screen.getByRole('dialog', { name: '공지 이미지 크게 보기' })

    expect(
      within(viewer).getByRole('group', { name: '2 / 2' }),
    ).toHaveAttribute('data-current')
    expect(
      within(viewer).getByRole('group', { name: '1 / 2' }),
    ).not.toHaveAttribute('data-current')

    fireEvent.click(
      within(viewer).getByRole('button', {
        name: '공지 이미지 크게 보기 닫기',
      }),
    )

    expect(
      screen.queryByRole('dialog', { name: '공지 이미지 크게 보기' }),
    ).not.toBeInTheDocument()
  })

  it('renders the not found page without fetching for an invalid notice id', () => {
    mockParams.noticeId = 'abc'

    renderNoticeDetailPage()

    expect(
      screen.getByRole('heading', { name: '404 페이지' }),
    ).toBeInTheDocument()
    expect(mockedGetNoticeDetail).not.toHaveBeenCalled()
  })

  it('renders the not found page when the notice does not exist', async () => {
    mockedGetNoticeDetail.mockRejectedValue(
      new ApiError(
        {
          success: false,
          code: 'NOTICE-001',
          message: 'not found',
          data: null,
          timestamp: '',
          path: '/api/v1/notices/3',
        },
        404,
      ),
    )

    renderNoticeDetailPage()

    expect(
      await screen.findByRole('heading', { name: '404 페이지' }),
    ).toBeInTheDocument()
  })

  it('goes back when the back button is pressed', async () => {
    mockedGetNoticeDetail.mockResolvedValue(noticeDetailFixture)

    renderNoticeDetailPage()

    fireEvent.click(await screen.findByRole('button', { name: '뒤로가기' }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
