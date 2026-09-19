import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import emptyImage from '@/shared/assets/images/empty.webp'
import { Empty } from '@/shared/components/empty'

describe('Empty', () => {
  it('renders the graphic and message and invokes the action', () => {
    const onAction = vi.fn()
    const { container } = render(
      <Empty
        actionLabel="일본 맛집 추천받기"
        description="최근 방문한 맛집이 없어요."
        onAction={onAction}
      />,
    )

    expect(
      container.querySelector(`img[src="${emptyImage}"]`),
    ).toBeInTheDocument()
    expect(screen.getByText('최근 방문한 맛집이 없어요.')).toBeInTheDocument()

    const action = screen.getByRole('button', {
      name: '일본 맛집 추천받기',
    })

    fireEvent.click(action)

    expect(onAction).toHaveBeenCalledOnce()
  })
})
