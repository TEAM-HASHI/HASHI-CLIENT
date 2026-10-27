import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import {
  CollectionDropdown,
  CollectionEditMenu,
  CollectionActionMenu,
} from '@/pages/saved/components/CollectionDropdown'

afterEach(cleanup)

it.each([true, false])(
  '상세 공유는 화면의 메뉴 배치 설정(%s)을 따른다',
  async (shareInMenu) => {
    const share = vi.fn()
    render(
      <CollectionActionMenu
        label="컬렉션 더보기"
        shareInMenu={shareInMenu}
        onManage={vi.fn()}
        onShare={share}
        onDelete={vi.fn()}
      />,
    )
    const user = userEvent.setup()
    if (shareInMenu) {
      expect(
        screen.queryByRole('button', { name: '컬렉션 공유' }),
      ).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: '컬렉션 더보기' }))
      expect(
        screen.getAllByRole('menuitem').map((item) => item.textContent),
      ).toEqual(['편집하기', '공유하기', '삭제하기'])
      await user.click(screen.getByRole('menuitem', { name: '공유하기' }))
    } else {
      await user.click(screen.getByRole('button', { name: '컬렉션 공유' }))
    }
    expect(share).toHaveBeenCalledOnce()
  },
)

it('저장 페이지 목록은 공유 아이콘 대신 더보기 메뉴에서 공유한다', async () => {
  const share = vi.fn()
  render(
    <CollectionEditMenu
      name="도쿄 여행"
      shareInMenu
      onEdit={vi.fn()}
      onShare={share}
      onDelete={vi.fn()}
    />,
  )
  const user = userEvent.setup()
  expect(
    screen.queryByRole('button', { name: '도쿄 여행 컬렉션 공유' }),
  ).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '도쿄 여행 더보기' }))
  expect(
    screen.getAllByRole('menuitem').map((item) => item.textContent),
  ).toEqual(['수정하기', '공유하기', '삭제하기'])
  await user.click(screen.getByRole('menuitem', { name: '공유하기' }))
  expect(share).toHaveBeenCalledOnce()
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
})

it('지도 패널 목록의 기존 공유 아이콘은 유지한다', () => {
  render(
    <CollectionEditMenu
      name="지도 여행"
      onEdit={vi.fn()}
      onShare={vi.fn()}
      onDelete={vi.fn()}
    />,
  )
  expect(
    screen.getByRole('button', { name: '지도 여행 컬렉션 공유' }),
  ).toBeVisible()
})

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
