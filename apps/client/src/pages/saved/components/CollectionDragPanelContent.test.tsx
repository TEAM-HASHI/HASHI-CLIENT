import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CollectionDragPanelContent } from '@/pages/saved/components/CollectionDragPanelContent'
import { collectionMocks } from '@/pages/saved/data/collectionMocks'
import type { CollectionViewState } from '@/pages/saved/types'

const onClose = vi.fn()
const onRestaurantSelect = vi.fn()
const Harness = ({
  availableHeight = 768,
  list = false,
  editable = false,
}: {
  availableHeight?: number
  list?: boolean
  editable?: boolean
}) => {
  const [view, setView] = useState<CollectionViewState>({
    collectionId: list ? null : 'spring',
    sort: 'rating',
    category: 'cafe',
  })
  return (
    <MemoryRouter initialEntries={['/map']}>
      <CollectionDragPanelContent
        data={collectionMocks}
        view={view}
        onViewChange={setView}
        availableHeight={availableHeight}
        onClose={onClose}
        onRestaurantSelect={onRestaurantSelect}
        onDataChange={editable ? vi.fn() : undefined}
      />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    left: 0,
    right: 393,
    bottom: 768,
    width: 393,
    height: 768,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe('CollectionDragPanelContent', () => {
  it('shows share only on the map panel and keeps list controls fixed while scrolling', () => {
    render(<Harness editable />)
    expect(screen.getByRole('button', { name: '컬렉션 공유' })).toBeVisible()
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
    expect(
      screen.queryByRole('button', { name: '컬렉션 공유' }),
    ).not.toBeInTheDocument()
    cleanup()
    render(<Harness list editable />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
    const create = screen.getByRole('button', { name: '새 컬렉션 만들기' })
    expect(create.parentElement?.parentElement).toHaveClass('sticky')
  })

  it('keeps share in the panel header but only edit and delete in its menu', async () => {
    const user = userEvent.setup()
    render(<Harness editable />)
    await user.click(screen.getByRole('button', { name: '컬렉션 더보기' }))
    expect(
      screen.getAllByRole('menuitem').map((item) => item.textContent),
    ).toEqual(['편집하기', '삭제하기'])
  })

  it('keeps the collection title and filters together while the panel scrolls', () => {
    render(<Harness editable />)
    const title = screen.getByRole('heading', { level: 2 })
    const sort = screen.getByRole('button', { name: '정렬 선택' })
    expect(title.closest('.sticky')).not.toBeNull()
    expect(title.closest('.sticky')).toBe(sort.closest('.sticky'))
  })

  it('shows total places and the share menu only in the fullscreen view', async () => {
    const user = userEvent.setup()
    render(<Harness editable />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
    const dialog = screen.getByRole('dialog', { name: '컬렉션 전체 화면' })
    expect(within(dialog).getByText('총 1곳')).toBeVisible()
    await user.click(
      within(dialog).getByRole('button', { name: '컬렉션 더보기' }),
    )
    expect(
      within(dialog)
        .getAllByRole('menuitem')
        .map((item) => item.textContent),
    ).toEqual(['편집하기', '공유하기', '삭제하기'])
  })

  it('uses collection count in the panel and total count in the fullscreen list', () => {
    const count = collectionMocks.collections.length
    render(<Harness list editable />)
    expect(
      screen.getByRole('heading', {
        name: new RegExp(`컬렉션\\s*${count}\\s*개`),
      }),
    ).toBeVisible()
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
    const dialog = screen.getByRole('dialog', { name: '컬렉션 전체 화면' })
    expect(
      within(dialog).getByRole('heading', {
        name: new RegExp(`총\\s*${count}\\s*개`),
      }),
    ).toBeVisible()
  })

  it('changes collection list actions between the panel and fullscreen page', async () => {
    const user = userEvent.setup()
    render(<Harness list editable />)

    await user.click(
      screen.getByRole('button', { name: '2026 도쿄 봄 여행 더보기' }),
    )
    expect(
      screen.getAllByRole('menuitem').map((item) => item.textContent),
    ).toEqual(['링크 복사', '수정하기', '삭제하기'])

    await user.keyboard('{Escape}')
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
    const dialog = screen.getByRole('dialog', { name: '컬렉션 전체 화면' })
    await user.click(
      within(dialog).getByRole('button', {
        name: '2026 도쿄 봄 여행 더보기',
      }),
    )
    expect(
      within(dialog)
        .getAllByRole('menuitem')
        .map((item) => item.textContent),
    ).toEqual(['수정하기', '공유하기', '삭제하기'])
  })

  it.each([false, true])(
    'opens a fullscreen query view and restores the panel (list=%s)',
    async (list) => {
      const user = userEvent.setup()
      render(<Harness list={list} />)
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
      const dialog = screen.getByRole('dialog', { name: '컬렉션 전체 화면' })
      const cta = within(dialog).getByRole('button', { name: '지도로 보기' })
      expect(cta).toHaveClass('shadow-[0_4px_4px_rgba(0,0,0,0.15)]')
      expect(cta.querySelector('svg path[d^="M14.2425"]')).toBeInTheDocument()
      expect(within(dialog).getByRole('navigation')).toBeVisible()
      expect(
        within(dialog).getByRole('button', { name: '지도' }),
      ).toHaveAttribute('aria-current', 'page')
      if (!list) {
        expect(within(dialog).getByText('별점순')).toBeVisible()
        expect(within(dialog).getByText('카페')).toBeVisible()
      }
      await user.click(
        within(dialog).getByRole('button', { name: '지도로 보기' }),
      )
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(onClose).not.toHaveBeenCalled()
      fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
      expect(
        screen.getByRole('dialog', { name: '컬렉션 전체 화면' }),
      ).toBeVisible()
    },
  )

  it('can expand repeatedly when normal and maximum heights are clamped together', async () => {
    const user = userEvent.setup()
    render(<Harness availableHeight={250} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowUp' })
    await user.click(screen.getByRole('button', { name: '지도로 보기' }))
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowUp' })
    expect(
      screen.getByRole('dialog', { name: '컬렉션 전체 화면' }),
    ).toBeVisible()
  })

  it('keeps dropdowns inside the fullscreen focus scope and closes only the menu on Escape', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
    const dialog = screen.getByRole('dialog', { name: '컬렉션 전체 화면' })
    await user.click(within(dialog).getByRole('button', { name: '정렬 선택' }))
    expect(within(dialog).getByRole('menu')).toBeVisible()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(dialog).toBeVisible()
  })
  it('preserves collection, sort and category across collapse and expansion', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const handle = screen.getByRole('slider')
    expect(handle).toHaveAttribute('aria-valuenow', '393')
    fireEvent.keyDown(handle, { key: 'Home' })
    expect(handle).toHaveAttribute('aria-valuenow', '30')
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.keyDown(handle, { key: 'ArrowUp' })
    expect(screen.getByText('별점순')).toBeVisible()
    expect(screen.getByText('카페')).toBeVisible()
    await user.click(screen.getByRole('button', { name: /히마와리 카페/ }))
    expect(onRestaurantSelect).toHaveBeenCalledWith('cafe')
    await user.click(
      screen.getByRole('button', { name: '컬렉션 지도 보기 종료' }),
    )
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('uses available height minus 12 including the handle and closes menus on collapse', async () => {
    const user = userEvent.setup()
    render(<Harness availableHeight={250} />)
    const handle = screen.getByRole('slider')
    expect(handle).toHaveAttribute('aria-valuemax', '238')
    expect(handle).toHaveAttribute('aria-valuenow', '238')
    await user.click(screen.getByRole('button', { name: '정렬 선택' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.keyDown(handle, { key: 'Home' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
