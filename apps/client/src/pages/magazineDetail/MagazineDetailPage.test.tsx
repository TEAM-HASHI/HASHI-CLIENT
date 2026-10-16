import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const routeParams = vi.hoisted(() => ({ magazineId: '1' }))
const authStatus = vi.hoisted(() => ({ isAuthenticated: true }))

vi.mock('@/shared/hooks/useAuthStatus', () => ({
  useAuthStatus: () => authStatus,
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useParams: () => ({ magazineId: routeParams.magazineId }),
  }
})

import { MagazineDetailPage } from '@/pages/magazineDetail/MagazineDetailPage'
import { MagazineImage } from '@/pages/magazineDetail/components/MagazineImage'

describe('MagazineDetailPage', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
  })
  beforeEach(() => {
    routeParams.magazineId = '1'
    authStatus.isAuthenticated = true
  })

  it('never exposes publishing data in the production route', () => {
    vi.stubEnv('DEV', false)
    render(
      <MemoryRouter>
        <MagazineDetailPage />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('heading', { name: '서비스를 준비하고 있어요.' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /매거진 좋아요/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /히마와리/ }),
    ).not.toBeInTheDocument()
  })

  it('opens the login gate without changing likes for an anonymous user', () => {
    authStatus.isAuthenticated = false
    render(
      <MemoryRouter>
        <MagazineDetailPage />
      </MemoryRouter>,
    )

    const button = screen.getByRole('button', { name: /매거진 좋아요/ })
    const count = button.textContent
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(button.textContent).toBe(count)
    expect(
      screen.getByRole('dialog', { name: '로그인 안내' }),
    ).toBeInTheDocument()
  })

  it('resets local like state when the magazine id changes', () => {
    const { rerender } = render(
      <MemoryRouter>
        <MagazineDetailPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /매거진 좋아요/ }))
    expect(screen.getByRole('button', { name: /좋아요 취소/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    routeParams.magazineId = '2'
    rerender(
      <MemoryRouter>
        <MagazineDetailPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('button', { name: /매거진 좋아요/ }),
    ).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('MagazineImage', () => {
  afterEach(cleanup)

  it('retries a previously failed source after the source changes away and back', () => {
    const { container, rerender } = render(
      <MagazineImage alt="매거진 이미지" src="https://example.com/a.jpg" />,
    )

    fireEvent.error(container.querySelector('img')!)
    expect(container.querySelector('img')).not.toBeInTheDocument()

    rerender(
      <MagazineImage alt="매거진 이미지" src="https://example.com/b.jpg" />,
    )
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/b.jpg',
    )

    rerender(
      <MagazineImage alt="매거진 이미지" src="https://example.com/a.jpg" />,
    )
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/a.jpg',
    )
  })
})
