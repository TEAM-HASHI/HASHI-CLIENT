import '@testing-library/jest-dom/vitest'

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ReviewSubmitBar } from '@/features/review/components'

afterEach(() => {
  cleanup()
})

describe('ReviewSubmitBar', () => {
  it('keeps the review form action spacing and renders the save action', () => {
    render(<ReviewSubmitBar />)

    expect(
      screen.getByRole('contentinfo', { name: '리뷰 저장 액션' }),
    ).toHaveClass('pt-11.25')
    expect(screen.getByRole('button', { name: '저장하기' })).toBeInTheDocument()
  })
})
