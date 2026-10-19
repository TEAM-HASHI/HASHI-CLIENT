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
import { useState, type ReactElement } from 'react'
import { CollectionForm } from '@/pages/saved/components/CollectionForm'
import { collectionMocks } from '@/pages/saved/data/collectionMocks'
import { createCollection } from '@/pages/saved/utils/collectionMutations'

afterEach(cleanup)
const renderForm = (element: ReactElement, withForwardEntry = false) => {
  const router = createMemoryRouter(
    [
      { path: '/form', element },
      { path: '/previous', element: <div /> },
      { path: '/next', element: <div>다음 화면</div> },
    ],
    {
      initialEntries: [
        '/previous',
        '/form',
        ...(withForwardEntry ? ['/next'] : []),
      ],
      initialIndex: 1,
    },
  )
  render(<RouterProvider router={router} />)
  return router
}
describe('CollectionForm', () => {
  it('설명 Enter는 줄바꿈하지 않고 붙여넣은 개행은 공백으로 바꿔 제출한다', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm(
      <CollectionForm collections={[]} onSubmit={onSubmit} onClose={vi.fn()} />,
    )
    await user.type(screen.getByLabelText('컬렉션명'), '새 여행')
    await user.click(screen.getByRole('radio', { name: '빨강' }))
    const description = screen.getByLabelText('설명')
    await user.type(description, '첫 설명{Enter}')
    expect(description).toHaveValue('첫 설명')
    await user.clear(description)
    await user.paste('첫 줄\r\n둘째 줄\n셋째 줄')
    expect(description).toHaveValue('첫 줄 둘째 줄 셋째 줄')
    expect(screen.getByText('/30').parentElement).toHaveTextContent('13/30')
    await user.click(screen.getByRole('button', { name: '만들기' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ description: '첫 줄 둘째 줄 셋째 줄' }),
    )
  })

  it('생성 후 화면 전환을 기다리는 동안 자기 자신을 중복으로 안내하지 않는다', () => {
    const CreateForm = () => {
      const [data, setData] = useState(collectionMocks)
      return (
        <>
          <CollectionForm
            collections={data.collections}
            onClose={() => {}}
            onSubmit={(draft) =>
              setData((current) =>
                createCollection(
                  current,
                  draft,
                  'created',
                  '2026-10-18T00:00:00Z',
                ),
              )
            }
          />
          <output aria-label="생성 결과">
            {data.collections.find((item) => item.id === 'created')?.name}
          </output>
        </>
      )
    }
    renderForm(<CreateForm />)
    fireEvent.change(screen.getByLabelText('컬렉션명'), {
      target: { value: '새 여행' },
    })
    fireEvent.click(screen.getByRole('radio', { name: '빨강' }))
    fireEvent.click(screen.getByRole('button', { name: '만들기' }))

    expect(screen.getByLabelText('생성 결과')).toHaveTextContent('새 여행')
    expect(screen.queryByText('중복된 컬렉션명입니다.')).not.toBeInTheDocument()
    expect(screen.getByLabelText('컬렉션명')).toHaveAttribute(
      'aria-invalid',
      'false',
    )
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()
  })

  it('수정 중에도 브라우저 앞으로가기는 차단하지 않는다', async () => {
    const previousHistoryState = window.history.state
    try {
      window.history.replaceState({ idx: 1 }, '')
      const router = renderForm(
        <CollectionForm
          collection={collectionMocks.collections[0]}
          collections={collectionMocks.collections}
          onSubmit={vi.fn()}
          onClose={vi.fn()}
        />,
        true,
      )
      fireEvent.change(screen.getByLabelText('컬렉션명'), {
        target: { value: '수정 원문' },
      })
      window.history.replaceState({ idx: 2 }, '')
      await act(async () => {
        await router.navigate(1)
      })
      expect(router.state.location.pathname).toBe('/next')
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    } finally {
      window.history.replaceState(previousHistoryState, '')
    }
  })

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
    const dialog = await screen.findByRole('alertdialog', {
      name: '변경사항이 저장되지 않았어요.',
    })
    expect(
      within(dialog).getByText('저장하지 않고 나가면 변경사항이 사라져요.'),
    ).toBeVisible()
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
    expect(screen.getByText('글자 수 제한을 초과했어요.')).toBeVisible()
    expect(screen.getByText('/20').parentElement).toHaveTextContent('21 /20')
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()
  })
  it('설명은 한글 조합 중 31자를 보존하고 30자로 수정하면 제출할 수 있다', () => {
    renderForm(
      <CollectionForm collections={[]} onSubmit={vi.fn()} onClose={vi.fn()} />,
    )
    fireEvent.change(screen.getByLabelText('컬렉션명'), {
      target: { value: '새 여행' },
    })
    fireEvent.click(screen.getByRole('radio', { name: '빨강' }))
    const description = screen.getByLabelText('설명')
    fireEvent.compositionStart(description)
    fireEvent.change(description, { target: { value: '가'.repeat(31) } })
    expect(description).toHaveValue('가'.repeat(31))
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()
    fireEvent.compositionEnd(description)
    expect(screen.getByText('/30').parentElement).toHaveTextContent('31/30')
    expect(screen.getByText('글자 수 제한을 초과했어요.')).toBeVisible()
    expect(screen.getByRole('button', { name: '만들기' })).toBeDisabled()

    fireEvent.change(description, { target: { value: '가'.repeat(30) } })
    expect(
      screen.queryByText('글자 수 제한을 초과했어요.'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('/30').parentElement).toHaveTextContent('30/30')
    expect(screen.getByRole('button', { name: '만들기' })).toBeEnabled()
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
      target: { value: '가'.repeat(31) },
    })
    expect(screen.getByText('중복된 컬렉션명입니다.')).toBeVisible()
    expect(screen.getByText('글자 수 제한을 초과했어요.')).toBeVisible()
  })
  it('앞뒤 공백만 바꾸면 저장을 비활성화하고 실제 변경 후 되돌리기도 판정한다', () => {
    const collection = {
      ...collectionMocks.collections[0],
      name: ' 여행 ',
      description: ' 설명 ',
    }
    renderForm(
      <CollectionForm
        collections={[collection]}
        collection={collection}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    const save = screen.getByRole('button', { name: '저장하기' })
    expect(save).toBeDisabled()
    fireEvent.change(screen.getByLabelText('컬렉션명'), {
      target: { value: '여행' },
    })
    expect(save).toBeDisabled()
    fireEvent.change(screen.getByLabelText('설명'), {
      target: { value: '  설명  ' },
    })
    expect(save).toBeDisabled()
    fireEvent.change(screen.getByLabelText('컬렉션명'), {
      target: { value: '여  행' },
    })
    expect(save).toBeEnabled()
    fireEvent.change(screen.getByLabelText('컬렉션명'), {
      target: { value: ' 여행 ' },
    })
    expect(save).toBeDisabled()
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
      expect.objectContaining({ name: '  수정 이름  ' }),
    )
  })
})
