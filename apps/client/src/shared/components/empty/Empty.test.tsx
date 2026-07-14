import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import emptyImage from '@/shared/assets/images/empty.webp'
import { Empty } from '@/shared/components/empty'

describe('Empty', () => {
  it('renders the QA graphic, message, and action sizing', () => {
    const onAction = vi.fn()
    const { container } = render(
      <Empty
        actionLabel="일본 맛집 추천받기"
        description="최근 방문한 맛집이 없어요."
        onAction={onAction}
      />,
    )

    expect(container.querySelector(`img[src="${emptyImage}"]`)).toHaveClass(
      'h-19',
      'w-[101px]',
    )
    expect(screen.getByText('최근 방문한 맛집이 없어요.')).toHaveClass(
      'typo-sub-header-1',
      'text-cool-gray-900',
    )

    const action = screen.getByRole('button', {
      name: '일본 맛집 추천받기',
    })

    expect(action).toHaveClass('h-[2.625rem]', 'w-[185px]')

    fireEvent.click(action)

    expect(onAction).toHaveBeenCalledOnce()
  })
})
