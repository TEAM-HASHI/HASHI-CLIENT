import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import type { ReactElement } from 'react'
import { CollectionForm } from '@/pages/saved/components/CollectionForm'
import { collectionMocks } from '@/pages/saved/data/collectionMocks'

afterEach(cleanup)
const renderForm = (element: ReactElement) => {
  const router = createMemoryRouter(
    [
      { path: '/form', element },
      { path: '/previous', element: <div /> },
    ],
    { initialEntries: ['/previous', '/form'] },
  )
  render(<RouterProvider router={router} />)
  return router
}
describe('CollectionForm', () => {
  it('한글 조합 중에는 자르거나 제출하지 않고 조합 종료 후 길이를 제한한다', () => {
    renderForm(
      <CollectionForm collections={[]} onSubmit={vi.fn()} onClose={vi.fn()} />,
    )
    const input = screen.getByLabelText('컬렉션명')
    fireEvent.click(screen.getByRole('radio', { name: '파랑' }))
    fireEvent.compositionStart(input)
    fireEvent.change(input, { target: { value: '가'.repeat(21) } })
    expect(input).toHaveValue('가'.repeat(21))
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()
    fireEvent.compositionEnd(input)
    expect(input).toHaveValue('가'.repeat(20))
  })
  it('브라우저 뒤로가기도 수정 폐기를 확인하고 저장하지 않고 닫는다', async () => {
    const onClose = vi.fn()
    const onSubmit = vi.fn()
    const router = renderForm(
      <CollectionForm
        collection={collectionMocks.collections[0]}
        collections={collectionMocks.collections}
        onSubmit={onSubmit}
        onClose={onClose}
      />,
    )
    fireEvent.change(screen.getByLabelText('컬렉션명'), {
      target: { value: '폐기할 수정' },
    })
    await act(async () => {
      await router.navigate(-1)
    })
    const dialog = await screen.findByRole('alertdialog')
    fireEvent.click(within(dialog).getByRole('button', { name: '뒤로가기' }))
    expect(onClose).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(router.state.location.pathname).toBe('/form')
  })
  it('중복 이름은 안내하고 만들기를 비활성화한다', () => {
    renderForm(
      <CollectionForm
        collections={collectionMocks.collections}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText('컬렉션명'), {
      target: { value: collectionMocks.collections[0].name },
    })
    fireEvent.click(screen.getByRole('radio', { name: '빨강' }))
    expect(screen.getByText('이미 사용 중인 컬렉션명이에요.')).toBeVisible()
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()
  })
  it('이름과 색상이 필요하며 생성 입력 공백을 유지한다', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    renderForm(
      <CollectionForm
        collections={collectionMocks.collections}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()
    await user.type(screen.getByLabelText('컬렉션명'), '  새 여행  ')
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()
    await user.click(screen.getByRole('radio', { name: '빨강' }))
    await user.click(screen.getByRole('button', { name: '만들기' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '  새 여행  ',
        color: 'red',
        isPublic: true,
      }),
    )
  })
  it('붙여넣기 초과 입력을 제한하고 오류와 글자 수를 표시한다', () => {
    renderForm(
      <CollectionForm collections={[]} onSubmit={vi.fn()} onClose={vi.fn()} />,
    )
    fireEvent.change(screen.getByLabelText('컬렉션명'), {
      target: { value: '가'.repeat(21) },
    })
    expect(screen.getByLabelText('컬렉션명')).toHaveValue('가'.repeat(20))
    expect(screen.getByText('글자 수 제한을 초과했어요.')).toBeVisible()
    expect(screen.getByText('/20')).toHaveTextContent('20 /20')
  })
  it('수정은 변경이 있어야 저장되고 취소 시 입력을 유지할 수 있다', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSubmit = vi.fn()
    renderForm(
      <CollectionForm
        collections={collectionMocks.collections}
        collection={collectionMocks.collections[0]}
        onSubmit={onSubmit}
        onClose={onClose}
      />,
    )
    expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled()
    await user.clear(screen.getByLabelText('컬렉션명'))
    await user.type(screen.getByLabelText('컬렉션명'), '  수정 이름  ')
    await user.click(screen.getByRole('button', { name: '뒤로가기' }))
    await user.click(screen.getByRole('button', { name: '계속하기' }))
    expect(screen.getByLabelText('컬렉션명')).toHaveValue('  수정 이름  ')
    expect(onClose).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '저장하기' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: '수정 이름' }),
    )
  })
})
