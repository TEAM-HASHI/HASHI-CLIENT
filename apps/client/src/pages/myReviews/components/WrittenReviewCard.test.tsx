import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { WrittenReviewCard } from '@/pages/myReviews/components/WrittenReviewCard'

afterEach(cleanup)

const setup = () => {
  const onOpenDetail = vi.fn()
  const onEdit = vi.fn()
  const Fixture = () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <WrittenReviewCard
          isDeleting={false}
          isMenuOpen={open}
          review={{
            id: '1',
            restaurantName: '식당',
            visitedAt: '2026.10.04',
            rating: 4,
          }}
          onCloseMenu={() => setOpen(false)}
          onDelete={async () => {}}
          onEdit={onEdit}
          onOpenDetail={onOpenDetail}
          onToggleMenu={() => setOpen((value) => !value)}
        />
        <button type="button">다음 버튼</button>
      </>
    )
  }
  render(<Fixture />)
  return {
    user: userEvent.setup(),
    trigger: screen.getByRole('button', { name: '식당 리뷰 메뉴 열기' }),
    onOpenDetail,
    onEdit,
  }
}

describe('WrittenReviewCard 메뉴', () => {
  it('Enter로 열면 첫 항목에 포커스하고 방향키로 순환한다', async () => {
    const { user, trigger } = setup()
    trigger.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('menuitem', { name: '수정하기' })).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: '삭제하기' })).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: '수정하기' })).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('menuitem', { name: '삭제하기' })).toHaveFocus()
  })

  it('Escape로 닫으면 더보기 버튼으로 포커스가 돌아온다', async () => {
    const { user, trigger } = setup()
    await user.click(trigger)
    screen.getByRole('menuitem', { name: '삭제하기' }).focus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('아래 방향키로 열고 Home/End로 처음과 마지막 항목으로 이동한다', async () => {
    const { user, trigger } = setup()
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: '수정하기' })).toHaveFocus()
    await user.keyboard('{End}')
    expect(screen.getByRole('menuitem', { name: '삭제하기' })).toHaveFocus()
    await user.keyboard('{Home}')
    expect(screen.getByRole('menuitem', { name: '수정하기' })).toHaveFocus()
  })

  it('외부 버튼을 누르면 닫고 해당 버튼의 포커스를 유지한다', async () => {
    const { user, trigger } = setup()
    await user.click(trigger)
    const next = screen.getByRole('button', { name: '다음 버튼' })
    await user.click(next)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(next).toHaveFocus()
  })

  it('Tab으로 메뉴를 벗어나면 닫히며 다음 버튼으로 이동한다', async () => {
    const { user, trigger } = setup()
    await user.click(trigger)
    await user.tab()
    expect(screen.getByRole('button', { name: '다음 버튼' })).toHaveFocus()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('메뉴와 수정 액션은 카드 상세 이동을 실행하지 않는다', async () => {
    const { user, trigger, onOpenDetail, onEdit } = setup()
    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: '수정하기' }))
    expect(onEdit).toHaveBeenCalledOnce()
    expect(onOpenDetail).not.toHaveBeenCalled()
  })
})
