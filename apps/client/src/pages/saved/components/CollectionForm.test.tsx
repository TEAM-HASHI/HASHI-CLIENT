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
  it('한글 조합으로 제한을 넘겨도 입력값과 실제 글자 수를 유지한다', () => {
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
    expect(input).toHaveValue('가'.repeat(21))
    expect(screen.getByText('/20').parentElement).toHaveTextContent('21 /20')
    expect(screen.getByText('글자 수 제한을 초과했어요.')).toBeVisible()
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
    expect(screen.getByText('중복된 컬렉션명입니다.')).toBeVisible()
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
  it('제한을 넘긴 이름을 유지하고 오류와 실제 글자 수를 표시한다', () => {
    renderForm(
      <CollectionForm collections={[]} onSubmit={vi.fn()} onClose={vi.fn()} />,
    )
    fireEvent.change(screen.getByLabelText('컬렉션명'), {
      target: { value: '가'.repeat(21) },
    })
    expect(screen.getByLabelText('컬렉션명')).toHaveValue('가'.repeat(21))
    expect(screen.getByText('글자 수 제한을 초과했어요.')).toHaveClass(
      'typo-body-7',
    )
    expect(screen.getByText('/20').parentElement).toHaveTextContent('21 /20')
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()
  })
  it('설명은 HDS Textarea에서 제한 초과 입력과 카운터를 표시한다', () => {
    renderForm(
      <CollectionForm collections={[]} onSubmit={vi.fn()} onClose={vi.fn()} />,
    )
    const description = screen.getByLabelText('설명')
    expect(screen.getByLabelText('컬렉션명').parentElement).toHaveClass(
      'h-[53px]',
      'px-5',
    )
    expect(description.tagName).toBe('TEXTAREA')
    expect(description.parentElement).toHaveClass('gap-3')
    expect(description).toHaveClass(
      'min-h-[51px]',
      'max-h-[129px]',
      'px-5',
      'py-4',
    )

    let scrollHeight = 78
    vi.spyOn(description, 'scrollHeight', 'get').mockImplementation(
      () => scrollHeight,
    )
    fireEvent.change(description, { target: { value: '중간 길이 설명' } })
    expect(description).toHaveStyle({ height: '80px', overflowY: 'hidden' })

    scrollHeight = 128
    fireEvent.change(description, { target: { value: '가'.repeat(101) } })
    expect(description).toHaveStyle({ height: '129px', overflowY: 'auto' })
    expect(description).toHaveValue('가'.repeat(101))
    expect(screen.getByText('/100').parentElement).toHaveTextContent('101/100')
    expect(screen.getByText('글자 수 제한을 초과했어요.')).toHaveClass(
      'typo-body-7',
    )
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()

    scrollHeight = 40
    fireEvent.change(description, { target: { value: '' } })
    expect(description).toHaveStyle({ height: '51px', overflowY: 'hidden' })
  })
  it('중복 이름과 설명 길이 초과 오류를 동시에 표시한다', () => {
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
    fireEvent.change(screen.getByLabelText('설명'), {
      target: { value: '가'.repeat(101) },
    })
    expect(screen.getByText('중복된 컬렉션명입니다.')).toBeVisible()
    expect(screen.getByText('글자 수 제한을 초과했어요.')).toBeVisible()
  })
  it('색상 선택 표시와 하단 버튼 여백을 리디자인 수치로 표시한다', () => {
    renderForm(
      <CollectionForm collections={[]} onSubmit={vi.fn()} onClose={vi.fn()} />,
    )
    const red = screen.getByRole('radio', { name: '빨강' })
    fireEvent.click(red)
    expect(red.closest('label')?.querySelector('svg')).toHaveClass('size-6.5')
    expect(
      screen.getByRole('button', { name: '만들기' }).parentElement,
    ).toHaveClass('pb-[max(48px,var(--safe-area-bottom,0px))]')
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
