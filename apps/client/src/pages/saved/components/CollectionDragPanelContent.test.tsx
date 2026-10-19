import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CollectionDragPanelContent } from '@/pages/saved/components/CollectionDragPanelContent'
import { collectionMocks } from '@/pages/saved/data/collectionMocks'
import type { CollectionViewState } from '@/pages/saved/types'

const onClose = vi.fn()
const onRestaurantSelect = vi.fn()
const Harness = ({ availableHeight = 768 }: { availableHeight?: number }) => {
  const [view, setView] = useState<CollectionViewState>({
    collectionId: 'spring',
    sort: 'rating',
    category: 'cafe',
  })
  return (
    <CollectionDragPanelContent
      data={collectionMocks}
      view={view}
      onViewChange={setView}
      availableHeight={availableHeight}
      onClose={onClose}
      onRestaurantSelect={onRestaurantSelect}
    />
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
  it('resets height and open menus when switching away and back to a collection', async () => {
    const user = userEvent.setup()
    const props = {
      data: collectionMocks,
      view: {
        collectionId: 'spring',
        sort: 'rating',
        category: 'cafe',
      } as CollectionViewState,
      onViewChange: vi.fn(),
      availableHeight: 768,
      onClose,
      onRestaurantSelect,
    }
    const { rerender } = render(<CollectionDragPanelContent {...props} />, {
      wrapper: MemoryRouter,
    })
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
    await user.click(screen.getByRole('button', { name: '정렬 선택' }))
    rerender(
      <CollectionDragPanelContent
        {...props}
        view={{ ...props.view, collectionId: 'summer' }}
      />,
    )
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '393')
    rerender(<CollectionDragPanelContent {...props} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '393')
    expect(screen.getByText('별점순')).toBeVisible()
    expect(screen.getByText('카페')).toBeVisible()
  })

  it('preserves collection, sort and category across collapse and expansion', async () => {
    const user = userEvent.setup()
    render(<Harness />, { wrapper: MemoryRouter })
    const handle = screen.getByRole('slider')
    expect(handle).toHaveAttribute('aria-valuenow', '393')
    fireEvent.keyDown(handle, { key: 'Home' })
    expect(handle).toHaveAttribute('aria-valuenow', '30')
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.keyDown(handle, { key: 'ArrowUp' })
    const list = screen.getByRole('list', { name: '저장 식당' })
    fireEvent.keyDown(handle, { key: 'End' })
    expect(handle).not.toBeVisible()
    expect(screen.getByRole('list', { name: '저장 식당' })).toBe(list)
    await user.click(screen.getByRole('button', { name: '지도로 보기' }))
    expect(handle).toHaveFocus()
    expect(handle).toHaveAttribute('aria-valuenow', '393')
    expect(screen.getByRole('list', { name: '저장 식당' })).toBe(list)
    expect(screen.getByText('별점순')).toBeVisible()
    expect(screen.getByText('카페')).toBeVisible()
    await user.click(screen.getByRole('button', { name: /히마와리 카페/ }))
    expect(onRestaurantSelect).toHaveBeenCalledWith('cafe')
    await user.click(
      screen.getByRole('button', { name: '컬렉션 지도 보기 종료' }),
    )
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes dropdowns on expansion and preserves the selected view when returning to the panel', async () => {
    const user = userEvent.setup()
    render(<Harness />, { wrapper: MemoryRouter })
    const handle = screen.getByRole('slider')
    await user.click(screen.getByRole('button', { name: '정렬 선택' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.keyDown(handle, { key: 'End' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '패널로 돌아가기' }))
    expect(screen.getByText('별점순')).toBeVisible()
    expect(screen.getByText('카페')).toBeVisible()
    expect(handle).toHaveFocus()
  })
})
