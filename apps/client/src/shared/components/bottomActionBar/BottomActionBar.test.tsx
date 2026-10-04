import '@testing-library/jest-dom/vitest'

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BottomActionBar } from '@/shared/components/bottomActionBar'

describe('BottomActionBar', () => {
  it('renders leading, start, and end actions in a labeled group', () => {
    render(
      <BottomActionBar
        aria-label="식당 상세 액션"
        leadingAction={<button type="button">좋아요</button>}
        startAction={<button type="button">다시 추천 받기</button>}
        endAction={<button type="button">예약하기</button>}
      />,
    )

    const actionBar = screen.getByRole('group', {
      name: '식당 상세 액션',
    })

    expect(
      within(actionBar).getByRole('button', { name: '좋아요' }),
    ).toBeVisible()
    expect(
      within(actionBar).getByRole('button', { name: '다시 추천 받기' }),
    ).toBeVisible()
    expect(
      within(actionBar).getByRole('button', { name: '예약하기' }),
    ).toBeVisible()
  })

  it('renders only the required end action when optional slots are omitted', () => {
    render(
      <BottomActionBar
        aria-label="프로필 액션"
        endAction={<button type="button">완료</button>}
      />,
    )

    const actionBar = screen.getByRole('group', {
      name: '프로필 액션',
    })

    expect(within(actionBar).getAllByRole('button')).toHaveLength(1)
    expect(
      within(actionBar).getByRole('button', { name: '완료' }),
    ).toBeVisible()
  })
})
