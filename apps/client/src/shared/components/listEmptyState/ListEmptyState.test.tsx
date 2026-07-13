import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ListEmptyState } from '@/shared/components/listEmptyState'

describe('ListEmptyState', () => {
  it('renders the empty list message from props', () => {
    render(<ListEmptyState description="메뉴 리스트를 준비중이에요." />)

    expect(screen.getByText('메뉴 리스트를 준비중이에요.')).toBeInTheDocument()
    expect(
      screen.getByText('메뉴 리스트를 준비중이에요.').parentElement,
    ).toHaveClass('min-h-[320px]', 'items-center', 'justify-center')
  })
})
