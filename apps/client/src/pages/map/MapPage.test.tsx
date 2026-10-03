import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MapPage } from '@/pages/map/MapPage'

beforeEach(() => {
  // jsdom has no layout; keep the real DragPanel and supply its measured container.
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 393,
    bottom: 768,
    width: 393,
    height: 768,
    toJSON: () => ({}),
  })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('MapPage preview', () => {
  it('discloses preview data and keeps the real panel keyboard-operable', async () => {
    const user = userEvent.setup()
    render(<MapPage />)
    expect(
      screen.getByText('샘플 지도 · 실제 위치/예약 미연동'),
    ).toBeInTheDocument()
    const slider = screen.getByRole('slider', { name: '식당 목록 높이 조절' })
    slider.focus()
    await user.keyboard('{Home}')
    expect(slider).toHaveAttribute('aria-valuenow', '30')
    expect(
      screen.queryByRole('button', {
        name: '코코네 돈카츠 신도심점 상세 보기',
      }),
    ).not.toBeInTheDocument()
    await user.keyboard('{ArrowUp}')
    expect(
      screen.getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' }),
    ).toBeVisible()
  })
  it('filters categories, toggles back, and resets an empty submitted search', async () => {
    const user = userEvent.setup()
    render(<MapPage />)
    await user.click(screen.getByRole('button', { name: '카페' }))
    expect(
      screen.queryByRole('button', {
        name: '코코네 돈카츠 신도심점 상세 보기',
      }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '카페' }))
    expect(
      screen.getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' }),
    ).toBeVisible()
    await user.type(screen.getByRole('searchbox'), '없는 식당{Enter}')
    expect(screen.getByText('검색 조건에 맞는 식당이 없어요.')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '검색 조건 초기화' }))
    expect(
      screen.getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' }),
    ).toBeVisible()
  })
  it('sorts the sample list and closes the sort menu on selection', async () => {
    const user = userEvent.setup()
    render(<MapPage />)
    await user.click(screen.getByRole('button', { name: '정렬: 추천순' }))
    await user.click(screen.getByRole('menuitemradio', { name: '별점순' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '정렬: 별점순' })).toHaveFocus()
    const list = screen.getByRole('list', { name: '식당 검색 결과' })
    expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent(
      '히마와리 스시 신도심점',
    )
  })
  it('preserves the list scroll when collapsing but resets it after a filter change', async () => {
    const user = userEvent.setup()
    render(<MapPage />)
    const list = screen.getByRole('list', { name: '식당 검색 결과' })
    const scroller = list.closest('[data-map-list]')!.parentElement!
    fireEvent.scroll(scroller, { target: { scrollTop: 180 } })
    const slider = screen.getByRole('slider', { name: '식당 목록 높이 조절' })
    slider.focus()
    await user.keyboard('{Home}{ArrowUp}')
    expect(scroller.scrollTop).toBe(180)
    await user.click(screen.getByRole('button', { name: '카페' }))
    expect(
      screen
        .getByRole('list', { name: '식당 검색 결과' })
        .closest('[data-map-list]')!.parentElement!.scrollTop,
    ).toBe(0)
  })

  it('opens a selected restaurant, expands details, switches tabs and returns to its filtered list', async () => {
    const user = userEvent.setup()
    render(<MapPage />)
    await user.click(screen.getByRole('button', { name: '시부야 식당 보기' }))
    await user.click(
      screen.getByRole('button', { name: '야키니쿠 리키마루 상세 보기' }),
    )
    const slider = screen.getByRole('slider', { name: '식당 상세 높이 조절' })
    slider.focus()
    await user.keyboard('{End}')
    expect(screen.getByRole('heading', { name: '가게 상세' })).toBeVisible()
    await user.click(screen.getByRole('tab', { name: '메뉴' }))
    expect(
      screen.getByText('메뉴 정보는 API 연결 후 제공됩니다.'),
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: '식당 상세 닫기' }))
    expect(
      screen.getByRole('button', { name: '야키니쿠 리키마루 상세 보기' }),
    ).toBeVisible()
    expect(
      screen.queryByRole('button', {
        name: '코코네 돈카츠 신도심점 상세 보기',
      }),
    ).not.toBeInTheDocument()
  })

  it('clears the selected restaurant when the category changes', async () => {
    const user = userEvent.setup()
    render(<MapPage />)
    await user.click(
      screen.getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' }),
    )
    await user.click(screen.getByRole('button', { name: '카페' }))
    expect(
      screen.queryByRole('slider', { name: '식당 상세 높이 조절' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '도쿄 카페 미리보기 상세 보기' }),
    ).toBeVisible()
  })

  it('opens the chosen photo and restores focus to its thumbnail after Escape', async () => {
    const user = userEvent.setup()
    render(<MapPage />)
    await user.click(
      screen.getByRole('button', { name: '야키니쿠 리키마루 상세 보기' }),
    )
    const thumbnail = screen.getByRole('button', {
      name: '야키니쿠 리키마루 사진 2 보기',
    })
    await user.click(thumbnail)
    expect(
      screen.getByRole('dialog', { name: '식당 사진 상세보기' }),
    ).toBeVisible()
    await user.keyboard('{Escape}')
    expect(
      screen.queryByRole('dialog', { name: '식당 사진 상세보기' }),
    ).not.toBeInTheDocument()
    expect(thumbnail).toHaveFocus()
  })

  it('does not pretend saving or reserving a preview restaurant succeeded', async () => {
    const user = userEvent.setup()
    render(<MapPage />)
    await user.click(
      screen.getByRole('button', { name: '코코네 돈카츠 신도심점 저장' }),
    )
    expect(screen.getByRole('dialog')).toHaveTextContent(
      '서비스를 준비하고 있어요.',
    )
    await user.click(screen.getByRole('button', { name: '확인' }))
    await user.click(
      screen.getByRole('button', { name: '코코네 돈카츠 신도심점 상세 보기' }),
    )
    screen.getByRole('slider', { name: '식당 상세 높이 조절' }).focus()
    await user.keyboard('{End}')
    await user.click(screen.getByRole('button', { name: '예약하기' }))
    expect(screen.getByRole('dialog')).toHaveTextContent(
      '서비스를 준비하고 있어요.',
    )
  })
})
