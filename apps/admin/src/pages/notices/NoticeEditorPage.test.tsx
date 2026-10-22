import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NoticeEditorPage } from '@/pages/notices/NoticeEditorPage'
import { noticeApi } from '@/pages/notices/api/noticeApi'

vi.mock('@/pages/notices/api/noticeApi', () => ({
  noticeApi: {
    detail: vi.fn(),
    list: vi.fn(),
    save: vi.fn(),
    publish: vi.fn(),
    delete: vi.fn(),
  },
}))
const notice = {
  noticeId: 7,
  title: '기존 공지',
  status: 'DRAFT',
  body: [
    {
      type: 'PARAGRAPH' as const,
      items: [[{ text: '기존 본문', bold: true, href: '/terms' }]],
    },
  ],
  images: [{ assetId: 'second' }, { assetId: 'first' }],
}

const openEditor = (path = '/admin/notices/7') => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(
    [
      { path: '/admin/notices/new', element: <NoticeEditorPage /> },
      { path: '/admin/notices/:noticeId', element: <NoticeEditorPage /> },
      { path: '/admin/notices', element: <p>공지사항 목록</p> },
    ],
    { initialEntries: ['/admin/notices', path] },
  )
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}

describe('notice save and publication', () => {
  beforeEach(() => {
    vi.mocked(noticeApi.detail).mockReset().mockResolvedValue(notice)
    vi.mocked(noticeApi.save).mockReset()
    vi.mocked(noticeApi.publish).mockReset()
  })

  it('keeps edited text, formatting and existing attachment order after save failure', async () => {
    vi.mocked(noticeApi.save)
      .mockRejectedValueOnce(new Error('저장 실패'))
      .mockResolvedValueOnce({ ...notice, title: '수정 공지' })
    openEditor()
    const title = await screen.findByRole('textbox', { name: '공지사항 제목' })
    fireEvent.change(title, { target: { value: '수정 공지' } })
    expect(screen.getByRole('button', { name: '게시' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '임시 저장' }))
    await screen.findByText('저장 실패')
    expect(title).toHaveValue('수정 공지')
    expect(noticeApi.save).toHaveBeenLastCalledWith(7, {
      title: '수정 공지',
      body: notice.body,
      imageAssetIds: ['second', 'first'],
    })
    expect(noticeApi.publish).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '임시 저장' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '게시' })).toBeEnabled(),
    )
    expect(noticeApi.save).toHaveBeenCalledTimes(2)
  })

  it('prevents duplicate creation and retries publication without creating another draft', async () => {
    let resolveSave!: (value: typeof notice) => void
    vi.mocked(noticeApi.save).mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve
      }),
    )
    vi.mocked(noticeApi.publish)
      .mockRejectedValueOnce(new Error('게시 실패'))
      .mockResolvedValueOnce({ ...notice, status: 'PUBLISHED' })
    const router = openEditor('/admin/notices/new')
    fireEvent.change(screen.getByRole('textbox', { name: '공지사항 제목' }), {
      target: { value: '새 공지' },
    })
    fireEvent.change(
      screen.getByRole('textbox', {
        name: '본문 1 항목 1 텍스트 1',
      }),
      { target: { value: '새 본문' } },
    )
    const form = screen
      .getByRole('button', { name: '임시 저장' })
      .closest('form')!
    fireEvent.submit(form)
    fireEvent.submit(form)
    await waitFor(() => expect(noticeApi.save).toHaveBeenCalledTimes(1))
    await act(async () => resolveSave(notice))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/admin/notices/7'),
    )
    fireEvent.click(await screen.findByRole('button', { name: '게시' }))
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: '게시',
      }),
    )
    await screen.findByText('게시 실패')
    expect(screen.getByRole('textbox', { name: '공지사항 제목' })).toHaveValue(
      '기존 공지',
    )
    fireEvent.click(screen.getByRole('button', { name: '게시' }))
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: '게시',
      }),
    )
    await screen.findByText('게시됨')
    expect(noticeApi.save).toHaveBeenCalledTimes(1)
    expect(noticeApi.publish).toHaveBeenCalledTimes(2)
  })

  it('keeps unsaved inputs when browser back is canceled', async () => {
    const router = openEditor()
    const title = await screen.findByRole('textbox', { name: '공지사항 제목' })
    fireEvent.change(title, { target: { value: '작성 중' } })
    await act(async () => {
      await router.navigate(-1)
    })
    fireEvent.click(screen.getByRole('button', { name: '계속 작성' }))
    expect(title).toHaveValue('작성 중')
    expect(router.state.location.pathname).toBe('/admin/notices/7')
    expect(noticeApi.save).not.toHaveBeenCalled()
  })
})
