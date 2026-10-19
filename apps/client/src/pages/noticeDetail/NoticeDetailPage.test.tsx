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
  lastModifiedAt: '2026-09-06T10:00:00',
  status: 'PUBLISHED',
  body: [
    {
      type: 'PARAGRAPH',
      items: [
        [
          { text: '시스템 ', bold: false, href: null },
          { text: '점검', bold: true, href: null },
        ],
      ],
    },
  ],
  images: [
    {
      assetId: 'image-1',
      image: {
        assetId: 'image-1',
        role: 'NOTICE_DETAIL',
        status: 'READY',
        defaultSource: {
          url: 'https://example.com/notice-1.png',
          width: 706,
          height: 354,
          mimeType: 'image/png',
        },
        sourceSets: [
          {
            mimeType: 'image/png',
            candidates: [
              {
                url: 'https://example.com/notice-1.png',
                width: 706,
                height: 354,
              },
            ],
          },
        ],
      },
    },
    {
      assetId: 'image-2',
      image: {
        assetId: 'image-2',
        role: 'NOTICE_DETAIL',
        status: 'READY',
        defaultSource: {
          url: 'https://example.com/notice-2.png',
          width: 300,
          height: 600,
          mimeType: 'image/png',
        },
        sourceSets: [
          {
            mimeType: 'image/png',
            candidates: [
              {
                url: 'https://example.com/notice-2.png',
                width: 300,
                height: 600,
              },
            ],
          },
        ],
      },
    },
  ],
}

const renderNoticeDetailPage = (state: unknown = null) =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[{ pathname: '/notices/3', state }]}>
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

  it('returns direct entry to the notice list instead of browser history', async () => {
    mockedGetNoticeDetail.mockResolvedValue(noticeDetailFixture)
    renderNoticeDetailPage()
    fireEvent.click(await screen.findByRole('button', { name: '뒤로가기' }))
    expect(mockNavigate).toHaveBeenCalledWith('/notices', { replace: true })
  })

  it('returns to the previous list when entered from the notice list', async () => {
    mockedGetNoticeDetail.mockResolvedValue(noticeDetailFixture)
    renderNoticeDetailPage({ fromNoticeList: true })
    fireEvent.click(await screen.findByRole('button', { name: '뒤로가기' }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
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
          code: 'SUPPORT-001',
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

  it('returns direct entry to the notice list instead of browser history', async () => {
    mockedGetNoticeDetail.mockResolvedValue(noticeDetailFixture)
    renderNoticeDetailPage()
    fireEvent.click(await screen.findByRole('button', { name: '뒤로가기' }))
    expect(mockNavigate).toHaveBeenCalledWith('/notices', { replace: true })
  })

  it.each(['PROCESSING', 'FAILED'] as const)(
    'keeps a placeholder slot for a %s attachment without a source',
    async (status) => {
      mockedGetNoticeDetail.mockResolvedValue({
        ...noticeDetailFixture,
        images: [
          {
            assetId: 'image-1',
            image: {
              assetId: 'image-1',
              role: 'NOTICE_DETAIL',
              status,
              defaultSource: null,
              sourceSets: [],
            },
          },
          noticeDetailFixture.images[1]!,
        ],
      })
      renderNoticeDetailPage()
      const first = await screen.findByRole('button', {
        name: '첨부 이미지 1 크게 보기',
      })
      expect(first.querySelector('[data-slot="image-fallback"]')).not.toBeNull()
      expect(first.querySelector('img')).toBeNull()
      expect(
        screen.getByRole('img', { name: /첨부 이미지 2/ }),
      ).toHaveAttribute('src', 'https://example.com/notice-2.png')
      fireEvent.click(first)
      expect(
        screen
          .getByRole('dialog')
          .querySelector('[data-slot="image-fallback"]'),
      ).not.toBeNull()
    },
  )

  it('goes back when the back button is pressed', async () => {
    mockedGetNoticeDetail.mockResolvedValue(noticeDetailFixture)

    renderNoticeDetailPage({ fromNoticeList: true })

    fireEvent.click(await screen.findByRole('button', { name: '뒤로가기' }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
