import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { CollectionDropdown } from '@/pages/saved/components/CollectionDropdown'

afterEach(cleanup)

it('정렬 텍스트 클릭과 키보드로 메뉴를 열고 선택 후 트리거로 복귀한다', async () => {
  const change = vi.fn()
  const Example = () => {
    const [open, setOpen] = useState(false)
    return (
      <CollectionDropdown
        label="정렬"
        value="latest"
        options={[
          { value: 'latest', label: '최신순' },
          { value: 'rating', label: '별점순' },
        ]}
        open={open}
        onOpenChange={setOpen}
        onChange={change}
      />
    )
  }
  render(<Example />)
  const user = userEvent.setup()
  await user.click(screen.getByText('최신순'))
  expect(screen.getByRole('menu', { name: '정렬' })).toBeVisible()
  await user.click(screen.getByRole('menuitemradio', { name: '별점순' }))
  expect(change).toHaveBeenCalledWith('rating')
  expect(screen.getByRole('button', { name: '정렬 선택' })).toHaveFocus()
  await user.keyboard('{ArrowDown}')
  expect(screen.getByRole('menu')).toBeVisible()
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: '정렬 선택' })).toHaveFocus()
})
