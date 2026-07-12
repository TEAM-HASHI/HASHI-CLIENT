import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MypagePage } from '@/pages/mypage/MypagePage'

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('MypagePage', () => {
  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
  })

  it('renders primary action buttons with design token colors', () => {
    render(<MypagePage />)

    expect(screen.getByRole('button', { name: '수정' })).toHaveClass(
      'bg-cool-gray-800',
    )
    expect(screen.getByRole('button', { name: /내가 찜한 식당/ })).toHaveClass(
      'bg-cool-gray-800',
    )
  })
})
