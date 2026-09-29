import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { ComingSoonPage } from '@/pages/comingSoon/ComingSoonPage'

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

describe('ComingSoonPage', () => {
  afterEach(() => {
    mockNavigate.mockClear()
  })

  it('renders the guidance and navigates home', () => {
    render(
      <MemoryRouter>
        <ComingSoonPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: '서비스를 준비하고 있어요.',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/더 편한 Hashi 이용을 위해/)).toBeInTheDocument()

    const homeButton = screen.getByRole('button', {
      name: '홈으로 돌아가기',
    })

    fireEvent.click(homeButton)

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.home)
  })
})
