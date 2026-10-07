import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
