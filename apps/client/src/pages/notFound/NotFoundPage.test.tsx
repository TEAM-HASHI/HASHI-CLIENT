import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { NotFoundPage } from '@/pages/notFound/NotFoundPage'

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

describe('NotFoundPage', () => {
  afterEach(() => {
    mockNavigate.mockClear()
  })

  it('renders the QA layout and navigates home', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('presentation', { hidden: true })).toHaveClass(
      'h-[105px]',
      'w-[158px]',
    )
    expect(screen.getByText(/요청하신 페이지가 사라졌거나/)).toHaveClass(
      'typo-long-body-1',
    )

    const homeButton = screen.getByRole('button', {
      name: '홈으로 돌아가기',
    })

    expect(homeButton).toHaveClass('h-[2.625rem]', 'w-[185px]')

    fireEvent.click(homeButton)

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.home)
  })
})
