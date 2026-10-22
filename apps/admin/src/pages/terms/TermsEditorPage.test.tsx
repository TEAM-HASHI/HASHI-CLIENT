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
import { TermsEditorPage } from '@/pages/terms/TermsEditorPage'
import { termsApi } from '@/pages/terms/api/termsApi'
import { termsKeys } from '@/pages/terms/queries/termsQueries'

vi.mock('@/pages/terms/api/termsApi', () => ({
  termsApi: {
    types: vi.fn(),
    detail: vi.fn(),
    history: vi.fn(),
    save: vi.fn(),
    publish: vi.fn(),
    delete: vi.fn(),
  },
}))

const terms = {
  termsId: 7,
  type: 'SERVICE_TERMS' as const,
  title: '기존 약관',
  version: 'v1',
  effectiveDate: '2099-01-01',
  status: 'DRAFT',
  clauses: [
    { heading: '두 번째 조항', content: '  본문\n줄바꿈  ' },
    { heading: '첫 번째 조항', content: '<b>일반 텍스트</b>' },
  ],
}

const openEditor = (path = '/admin/terms/7') => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(
    [
      { path: '/admin/terms/new', element: <TermsEditorPage /> },
      { path: '/admin/terms/:termsId', element: <TermsEditorPage /> },
      { path: '/admin/terms', element: <p>약관 목록</p> },
    ],
    { initialEntries: ['/admin/terms', path] },
  )
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { client, router }
}

describe('terms version lifecycle', () => {
  beforeEach(() => {
    vi.mocked(termsApi.types)
      .mockReset()
      .mockResolvedValue([
        { type: 'SERVICE_TERMS', title: 'Hashi 이용약관', currentTermsId: 3 },
      ])
    vi.mocked(termsApi.detail).mockReset().mockResolvedValue(terms)
    vi.mocked(termsApi.save).mockReset()
    vi.mocked(termsApi.publish).mockReset()
    vi.mocked(termsApi.delete).mockReset()
  })

  it('retains draft text and clause order after duplicate-version and background query failures', async () => {
    vi.mocked(termsApi.save)
      .mockRejectedValueOnce(new Error('이미 사용 중인 약관 버전입니다'))
      .mockResolvedValueOnce({ ...terms, version: 'v2' })
    const { client } = openEditor()
    const version = await screen.findByRole('textbox', { name: '약관 버전' })
    fireEvent.change(version, { target: { value: 'v2' } })
    fireEvent.click(screen.getByRole('button', { name: '초안 저장' }))
    await screen.findByText('이미 사용 중인 약관 버전입니다')
    vi.mocked(termsApi.detail).mockRejectedValue(new Error('네트워크 오류'))
    await act(async () => {
      await client.invalidateQueries({ queryKey: termsKeys.detail(7) })
    })
    expect(screen.getByRole('textbox', { name: '약관 버전' })).toHaveValue('v2')
    expect(screen.getByRole('textbox', { name: '조항 1 내용' })).toHaveValue(
      '  본문\n줄바꿈  ',
    )
    fireEvent.click(screen.getByRole('button', { name: '초안 저장' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '게시' })).toBeEnabled(),
    )
    expect(termsApi.save).toHaveBeenLastCalledWith(7, {
      type: terms.type,
      title: terms.title,
      version: 'v2',
      effectiveDate: terms.effectiveDate,
      clauses: terms.clauses,
    })
  })

  it('prevents duplicate creation and retries publication on the saved draft without changing the previous current version on failure', async () => {
    let resolve!: (value: typeof terms) => void
    vi.mocked(termsApi.save).mockReturnValue(
      new Promise((done) => {
        resolve = done
      }),
    )
    vi.mocked(termsApi.publish)
      .mockRejectedValueOnce(new Error('게시 실패'))
      .mockResolvedValueOnce({ ...terms, status: 'CURRENT' })
    const { client, router } = openEditor('/admin/terms/new?type=SERVICE_TERMS')
    const title = await screen.findByRole('textbox', { name: '약관 제목' })
    fireEvent.change(title, { target: { value: '새 약관' } })
    fireEvent.change(screen.getByRole('textbox', { name: '약관 버전' }), {
      target: { value: 'v2' },
    })
    fireEvent.change(screen.getByLabelText('시행일'), {
      target: { value: '2099-01-01' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: '조항 1 제목' }), {
      target: { value: '조항' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: '조항 1 내용' }), {
      target: { value: '본문' },
    })
    const form = screen
      .getByRole('button', { name: '초안 저장' })
      .closest('form')!
    fireEvent.submit(form)
    fireEvent.submit(form)
    await waitFor(() => expect(termsApi.save).toHaveBeenCalledTimes(1))
    await act(async () => resolve(terms))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/admin/terms/7'),
    )
    client.setQueryData(termsKeys.detail(3), {
      ...terms,
      termsId: 3,
      status: 'CURRENT',
    })
    client.setQueryData(termsKeys.detail(8), {
      ...terms,
      termsId: 8,
      type: 'PRIVACY_POLICY',
      status: 'CURRENT',
    })
    client.setQueryData(termsKeys.history('PRIVACY_POLICY', 0), { terms: [] })
    fireEvent.click(await screen.findByRole('button', { name: '게시' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      '시행일이 미래여도 게시 즉시',
    )
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: '게시',
      }),
    )
    await screen.findByText('게시 실패')
    expect(client.getQueryData(termsKeys.detail(3))).toMatchObject({
      status: 'CURRENT',
    })
    expect(client.getQueryState(termsKeys.detail(3))?.isInvalidated).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: '게시' }))
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: '게시',
      }),
    )
    await screen.findByText('현재 적용')
    expect(client.getQueryState(termsKeys.detail(3))?.isInvalidated).toBe(true)
    expect(client.getQueryState(termsKeys.detail(8))?.isInvalidated).toBe(false)
    expect(
      client.getQueryState(termsKeys.history('PRIVACY_POLICY', 0))
        ?.isInvalidated,
    ).toBe(false)
    expect(termsApi.save).toHaveBeenCalledTimes(1)
    expect(termsApi.publish).toHaveBeenNthCalledWith(2, 7)
    expect(screen.getByRole('textbox', { name: '약관 제목' })).toBeDisabled()
  })

  it('blocks publishing unseen server changes and keeps local inputs until explicitly replaced', async () => {
    const { client } = openEditor()
    const title = await screen.findByRole('textbox', { name: '약관 제목' })
    fireEvent.click(screen.getByRole('button', { name: '게시' }))
    const latest = {
      ...terms,
      title: '서버에서 수정한 제목',
      clauses: [{ heading: '수정 조항', content: '최신 본문' }],
    }
    vi.mocked(termsApi.detail).mockResolvedValue(latest)
    await act(async () => {
      await client.invalidateQueries({ queryKey: termsKeys.detail(7) })
    })
    await screen.findByText(/서버의 약관 내용이나 게시 상태가 변경되었습니다/)
    const confirm = within(screen.getByRole('alertdialog')).getByRole(
      'button',
      { name: '게시' },
    )
    expect(confirm).toBeDisabled()
    fireEvent.click(confirm)
    expect(termsApi.publish).not.toHaveBeenCalled()
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: '취소',
      }),
    )
    fireEvent.change(title, { target: { value: '내 미저장 제목' } })
    expect(screen.getByRole('button', { name: '초안 저장' })).toBeDisabled()
    fireEvent.submit(title.closest('form')!)
    expect(termsApi.save).not.toHaveBeenCalled()
    expect(title).toHaveValue('내 미저장 제목')
    fireEvent.click(
      screen.getByRole('button', { name: '최신 저장본으로 교체' }),
    )
    expect(title).toHaveValue(latest.title)
    expect(screen.getByRole('textbox', { name: '조항 1 내용' })).toHaveValue(
      '최신 본문',
    )
    expect(screen.getByRole('button', { name: '게시' })).toBeEnabled()
    fireEvent.change(title, { target: { value: '게시 직전 미저장 제목' } })
    vi.mocked(termsApi.detail).mockResolvedValue({
      ...latest,
      status: 'CURRENT',
    })
    await act(async () => {
      await client.invalidateQueries({ queryKey: termsKeys.detail(7) })
    })
    await waitFor(() => expect(title).toBeDisabled())
    expect(title).toHaveValue('게시 직전 미저장 제목')
    fireEvent.click(
      screen.getByRole('button', { name: '최신 저장본으로 교체' }),
    )
    expect(title).toHaveValue(latest.title)
  })

  it.each(['CURRENT', 'ARCHIVED'])(
    'does not submit a published %s version even through form submission',
    async (status) => {
      vi.mocked(termsApi.detail).mockResolvedValue({ ...terms, status })
      openEditor()
      const title = await screen.findByRole('textbox', { name: '약관 제목' })
      expect(title).toBeDisabled()
      fireEvent.submit(title.closest('form')!)
      expect(termsApi.save).not.toHaveBeenCalled()
      expect(
        screen.queryByRole('button', { name: '게시' }),
      ).not.toBeInTheDocument()
    },
  )

  it('keeps inputs when leaving an unsaved version is canceled', async () => {
    const { router } = openEditor()
    const title = await screen.findByRole('textbox', { name: '약관 제목' })
    fireEvent.change(title, { target: { value: '작성 중' } })
    await act(async () => {
      await router.navigate(-1)
    })
    fireEvent.click(screen.getByRole('button', { name: '계속 작성' }))
    expect(title).toHaveValue('작성 중')
    expect(router.state.location.pathname).toBe('/admin/terms/7')
    expect(termsApi.save).not.toHaveBeenCalled()
  })
})
